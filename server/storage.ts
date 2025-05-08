import { practiceSession, type PracticeSession, type InsertPracticeSession } from "@shared/schema";

// Modify the interface with any CRUD methods you need
export interface IStorage {
  getUser(id: number): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;
  
  // New methods for practice sessions
  createPracticeSession(session: InsertPracticeSession): Promise<PracticeSession>;
  getPracticeSessionById(id: number): Promise<PracticeSession | undefined>;
  getPracticeSessionsByUserId(userId: number | null): Promise<PracticeSession[]>;
  getAllPracticeSessions(): Promise<PracticeSession[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, any>;
  private practiceSessions: Map<number, PracticeSession>;
  userCurrentId: number;
  sessionCurrentId: number;

  constructor() {
    this.users = new Map();
    this.practiceSessions = new Map();
    this.userCurrentId = 1;
    this.sessionCurrentId = 1;
  }

  async getUser(id: number): Promise<any | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: any): Promise<any> {
    const id = this.userCurrentId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createPracticeSession(insertSession: InsertPracticeSession): Promise<PracticeSession> {
    const id = this.sessionCurrentId++;
    const now = new Date();
    
    const session: PracticeSession = {
      ...insertSession,
      id,
      timestamp: now
    };
    
    this.practiceSessions.set(id, session);
    return session;
  }

  async getPracticeSessionById(id: number): Promise<PracticeSession | undefined> {
    return this.practiceSessions.get(id);
  }

  async getPracticeSessionsByUserId(userId: number | null): Promise<PracticeSession[]> {
    return Array.from(this.practiceSessions.values())
      .filter(session => session.userId === userId);
  }

  async getAllPracticeSessions(): Promise<PracticeSession[]> {
    return Array.from(this.practiceSessions.values());
  }
}

export const storage = new MemStorage();
