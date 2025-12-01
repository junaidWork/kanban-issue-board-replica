import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useStore } from '../store/useStore';
import { usePolling } from '../hooks/usePolling';
import { useRecentlyAccessed } from '../hooks/useRecentlyAccessed';
import { useAuth } from '../hooks/useAuth';
import { Issue, IssueStatus } from '../types';
import { SearchFilterBar } from '../components/SearchFilterBar';
import { RecentlyAccessedSidebar } from '../components/RecentlyAccessedSidebar';
import { Button, Pagination } from '../components/shared';
import { BoardSkeleton } from '../components/BoardSkeleton';
import { BoardColumn } from '../components/BoardColumn';
import { DraggableIssue } from '../components/DraggableIssue';
import { IssueCard } from '../components/IssueCard';
import { useUndoTimer } from '../hooks/useUndoTimer';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { BOARD_COLUMNS } from '../constants/app';
import './BoardPage.css';

export const BoardPage = () => {
  const {
    filteredIssues,
    loading,
    lastSyncTime,
    undoableAction,
    filters,
    pollingInterval,
    currentPage,
    itemsPerPage,
    fetchIssues,
    updateIssueStatus,
    setFilters,
    undoLastAction,
    setCurrentPage,
    issues,
  } = useStore();

  const { canEdit } = useAuth();
  const { recentIssues, clearRecentlyAccessed } = useRecentlyAccessed();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Fetch issues on mount
  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  // Polling
  usePolling({
    interval: pollingInterval,
    enabled: true,
    onPoll: fetchIssues,
  });

  // Undo timer
  const timeLeft = useUndoTimer(undoableAction?.timestamp ?? null, () => {
    // Automatically clear undo action after timeout
    useStore.setState({ undoableAction: null });
  });

  // Show undo toast
  useEffect(() => {
    if (undoableAction && timeLeft) {
      const toastId = toast.info(
        <div className='undo-toast'>
          <span>Issue moved</span>
          <Button variant='secondary' size='small' onClick={handleUndo}>
            Undo ({Math.ceil(timeLeft / 1000)}s)
          </Button>
        </div>,
        {
          position: 'bottom-center',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: false,
        }
      );
      return () => toast.dismiss(toastId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [undoableAction?.timestamp]);

  const handleUndo = async () => {
    await undoLastAction();
    toast.dismiss();
    toast.success('Action undone');
  };

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !canEdit) return;

    const issueId = active.id as string;
    const newStatus = over.id as IssueStatus;

    await updateIssueStatus(issueId, newStatus);
  };

  // Get unique assignees for filter
  const assignees = useMemo(() => {
    return Array.from(new Set(issues.map((issue) => issue.assignee)));
  }, [issues]);

  // Group issues by status
  const issuesByStatus = useMemo(() => {
    const grouped: Record<IssueStatus, Issue[]> = {
      Backlog: [],
      'In Progress': [],
      Done: [],
    };

    filteredIssues.forEach((issue) => {
      if (grouped[issue.status]) {
        grouped[issue.status].push(issue);
      }
    });

    return grouped;
  }, [filteredIssues]);

  // Paginated issues for each column
  const paginatedIssues = useMemo(() => {
    const result: Record<IssueStatus, { issues: Issue[]; totalPages: number }> = {
      Backlog: { issues: [], totalPages: 1 },
      'In Progress': { issues: [], totalPages: 1 },
      Done: { issues: [], totalPages: 1 },
    };

    BOARD_COLUMNS.forEach((status) => {
      const columnIssues = issuesByStatus[status];
      const totalPages = Math.ceil(columnIssues.length / itemsPerPage);
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;

      result[status] = {
        issues: columnIssues.slice(startIndex, endIndex),
        totalPages,
      };
    });

    return result;
  }, [issuesByStatus, currentPage, itemsPerPage]);

  const activeIssue = activeId ? issues.find((i) => i.id === activeId) : null;

  const hasActiveFilters = useMemo(() => filters.search || filters.assignee || filters.severity !== null, [filters]);

  const handleResetFilters = () => {
    setFilters({ search: '', assignee: '', severity: null });
  };

  const toggleSidebar = () => {
    if (showSidebar) {
      setIsClosing(true);
      setTimeout(() => {
        setShowSidebar(false);
        setIsClosing(false);
      }, 300);
    } else {
      setShowSidebar(true);
    }
  };

  const maxTotalPages = useMemo(
    () => Math.max(...BOARD_COLUMNS.map((s) => paginatedIssues[s].totalPages)),
    [paginatedIssues]
  );

  return (
    <div className='board-page'>
      <div className='board-content'>
        <div className='board-header'>
          <div className='board-title-section'>
            <h1>Issue Board</h1>
            {lastSyncTime && <span className='last-sync'>Last synced: {dayjs(lastSyncTime).format('HH:mm:ss')}</span>}
          </div>

          <div className='board-actions'>
            {!canEdit && <span className='read-only-badge'>Read Only</span>}
            {hasActiveFilters && (
              <Button variant='ghost' size='small' onClick={handleResetFilters}>
                Reset Filters
              </Button>
            )}
            <Button variant='ghost' size='small' onClick={toggleSidebar}>
              {showSidebar ? 'Hide' : 'Show'} Recent
            </Button>
          </div>
        </div>

        <SearchFilterBar filters={filters} onFilterChange={setFilters} assignees={assignees} />

        {loading && !issues.length ? (
          <BoardSkeleton />
        ) : (
          <>
            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <div className='board-columns'>
                {BOARD_COLUMNS.map((status) => (
                  <BoardColumn
                    key={status}
                    status={status}
                    issues={paginatedIssues[status].issues}
                    totalIssues={issuesByStatus[status].length}
                    canEdit={canEdit}
                  >
                    {paginatedIssues[status].issues.map((issue) => (
                      <DraggableIssue key={issue.id} issue={issue} canEdit={canEdit} />
                    ))}
                  </BoardColumn>
                ))}
              </div>

              <DragOverlay>{activeIssue && <IssueCard issue={activeIssue} isDragging />}</DragOverlay>
            </DndContext>

            <Pagination currentPage={currentPage} totalPages={maxTotalPages} onPageChange={setCurrentPage} />
          </>
        )}
      </div>

      {showSidebar && (
        <RecentlyAccessedSidebar issues={recentIssues} onClear={clearRecentlyAccessed} isClosing={isClosing} />
      )}
    </div>
  );
};
