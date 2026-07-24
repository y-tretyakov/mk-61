import type { Lesson } from '../data/lessons'
import { lessons } from '../data/lessons'

export interface BFFResponse<T> {
  data: T
  status: 'ok' | 'error'
  error?: string
}

export const calculatorApi = {
  async getLessons(): Promise<BFFResponse<Lesson[]>> {
    return { data: lessons, status: 'ok' }
  },

  async getLessonById(idx: number): Promise<BFFResponse<Lesson | null>> {
    const lesson = lessons[idx]
    if (!lesson) return { data: null, status: 'error', error: 'Lesson not found' }
    return { data: lesson, status: 'ok' }
  },

  async getVersion(): Promise<BFFResponse<string>> {
    return { data: '2.0.0', status: 'ok' }
  },
}

export type { Lesson }