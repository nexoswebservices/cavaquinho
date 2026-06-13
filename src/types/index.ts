export interface Lesson {
  id: string
  title: string
  description: string
  duration: string
  content: string
  tips?: string[]
  chords?: string[]
}

export interface Module {
  id: string
  title: string
  description: string
  icon: string
  color: string
  lessons: Lesson[]
}

export interface ProgressMap {
  [key: string]: boolean // "moduleId:lessonId" → completed
}
