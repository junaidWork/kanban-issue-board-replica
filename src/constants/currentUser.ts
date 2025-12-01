import { UserRole } from '../types';

export const availableUsers = [
    { name: 'Alice', role: 'admin' as UserRole },
    { name: 'Bob', role: 'contributor' as UserRole },
];

// Initialize from localStorage or default to admin
const getInitialUser = () => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            return JSON.parse(savedUser);
        } catch {
            return availableUsers[0];
        }
    }
    return availableUsers[0];
};

export const currentUser: { name: string; role: UserRole } = getInitialUser();

export const switchUser = (userName: string) => {
    const user = availableUsers.find(u => u.name === userName);
    if (user) {
        currentUser.name = user.name;
        currentUser.role = user.role;
        // Save to localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
    }
};
