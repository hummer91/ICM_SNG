import { User, CreateUserRequest, UpdateUserRequest } from '../types/User';
import { generateId } from '../utils/helpers';

export class UserService {
  private users: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
    },
  ];

  async getAllUsers(): Promise<User[]> {
    return this.users;
  }

  async getUserById(id: string): Promise<User | null> {
    const user = this.users.find(user => user.id === id);
    return user || null;
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    // 이메일 중복 확인
    const existingUser = this.users.find(user => user.email === userData.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const newUser: User = {
      id: generateId(),
      name: userData.name,
      email: userData.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<User | null> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      return null;
    }

    const currentUser = this.users[userIndex];
    if (!currentUser) {
      return null;
    }

    // 이메일 중복 확인 (다른 사용자가 사용 중인지)
    if (userData.email) {
      const existingUser = this.users.find(user => user.email === userData.email && user.id !== id);
      if (existingUser) {
        throw new Error('Email already exists');
      }
    }

    const updatedUser: User = {
      id: currentUser.id,
      name: userData.name ?? currentUser.name,
      email: userData.email ?? currentUser.email,
      createdAt: currentUser.createdAt,
      updatedAt: new Date(),
    };

    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      return false;
    }

    this.users.splice(userIndex, 1);
    return true;
  }
}
