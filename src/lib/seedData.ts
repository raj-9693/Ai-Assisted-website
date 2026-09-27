import { Note } from '@/types/note';
import { storage } from './storage';

const NOTE_COLORS = ['#FFF4CC', '#E6F0FF', '#E9F7EF', '#FDECEF', '#F1EEFF'];

export const seedSampleData = () => {
  const existingNotes = storage.getNotes();
  if (existingNotes.length > 0) return; // Don't seed if data already exists

  const sampleNotes: Note[] = [
    {
      id: '1',
      title: 'Mid test exam',
      content: 'Ultrices viverra odio congue lecos felis, libero elegestas nunc sagi are maza, elit ornare eget sem veib in ulum.\n\nIn augue cursus or adipiscing felis, diam volutpat mauris, id and',
      type: 'typed',
      color: '#FFF4CC',
      timestamp: new Date('2021-12-12T10:30:00'),
      isPinned: false,
    },
    {
      id: '2',
      title: 'Project Ideas',
      content: 'Ultrices viverra odio congue lecos felis, libero elegestas nunc sagi are maza, elit ornare eget sem veib in ulum.\n\nIn augue cursus or adipiscing felis, diam volutpat mauris, id and',
      type: 'typed',
      color: '#FDECEF',
      timestamp: new Date('2021-12-12T10:30:00'),
      isPinned: false,
    },
    {
      id: '3',
      title: "Jonas's notes",
      content: 'Roloty viverra odio congue lecos felis, libero elegestas nunc sagi are maza, elit ornare eget sem veib in ulum.',
      type: 'drawing',
      color: '#E6F0FF',
      timestamp: new Date('2021-12-12T06:37:00'),
      isPinned: false,
    },
  ];

  sampleNotes.forEach(note => storage.saveNote(note));
};
