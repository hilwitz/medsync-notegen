
import { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CustomButton } from '@/components/ui/CustomButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Search, Plus, Save, Trash2, Edit2, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  const { toast } = useToast();
  
  useEffect(() => {
    fetchNotes();
  }, []);
  
  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      
      // For demonstration purposes, we're creating a simulated notes array
      // In a real application, this would be fetched from Supabase
      const simulatedNotes: Note[] = [
        {
          id: '1',
          title: 'Patient Follow-up Protocol',
          content: 'For chronic conditions, schedule follow-up every 3 months. For acute conditions, follow-up within 2 weeks. Always document patient compliance with treatment plan.',
          created_at: '2023-06-15T10:30:00Z',
          updated_at: '2023-06-15T10:30:00Z'
        },
        {
          id: '2',
          title: 'Medication Reference',
          content: 'Common dosages for hypertension medications:\n- Lisinopril: 10-40mg daily\n- Amlodipine: 2.5-10mg daily\n- Metoprolol: 25-100mg twice daily\n\nMonitor for side effects and adjust as needed.',
          created_at: '2023-05-22T14:15:00Z',
          updated_at: '2023-07-10T09:45:00Z'
        },
        {
          id: '3',
          title: 'Diabetes Management Guidelines',
          content: 'Target HbA1c < 7.0% for most patients.\nCheck HbA1c every 3 months until stable, then every 6 months.\nScreen for complications annually:\n- Retinopathy\n- Nephropathy\n- Neuropathy\n- Foot exam',
          created_at: '2023-04-03T11:20:00Z',
          updated_at: '2023-08-01T16:30:00Z'
        }
      ];
      
      setNotes(simulatedNotes);
      
      if (simulatedNotes.length > 0) {
        setActiveNote(simulatedNotes[0]);
        setTitle(simulatedNotes[0].title);
        setContent(simulatedNotes[0].content);
      }
      
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: "Error",
        description: "Failed to load notes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateNote = () => {
    const newNote: Note = {
      id: Math.random().toString(36).substring(7),
      title: 'New Note',
      content: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setNotes([newNote, ...notes]);
    setActiveNote(newNote);
    setTitle(newNote.title);
    setContent(newNote.content);
    setEditMode(true);
  };
  
  const handleSaveNote = async () => {
    if (!activeNote) return;
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your note",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const updatedNote = {
        ...activeNote,
        title,
        content,
        updated_at: new Date().toISOString()
      };
      
      // Update the notes array
      setNotes(notes.map(note => 
        note.id === activeNote.id ? updatedNote : note
      ));
      
      setActiveNote(updatedNote);
      setEditMode(false);
      
      toast({
        title: "Success",
        description: "Note saved successfully",
      });
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeleteNote = async () => {
    if (!activeNote) return;
    
    if (!confirm("Are you sure you want to delete this note?")) {
      return;
    }
    
    try {
      // Remove from notes array
      const filteredNotes = notes.filter(note => note.id !== activeNote.id);
      setNotes(filteredNotes);
      
      // Set active note to the first note in the list or null
      if (filteredNotes.length > 0) {
        setActiveNote(filteredNotes[0]);
        setTitle(filteredNotes[0].title);
        setContent(filteredNotes[0].content);
      } else {
        setActiveNote(null);
        setTitle('');
        setContent('');
      }
      
      setEditMode(false);
      
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive"
      });
    }
  };
  
  const handleNoteClick = (note: Note) => {
    setActiveNote(note);
    setTitle(note.title);
    setContent(note.content);
    setEditMode(false);
  };
  
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar />
        
        <SidebarInset className="bg-neutral-50 dark:bg-neutral-900">
          <div className="container px-4 py-8">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold">Notes</h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Manage your clinical notes and references
                  </p>
                </div>
                
                <CustomButton 
                  variant="primary" 
                  size="md"
                  className="flex items-center gap-2"
                  onClick={handleCreateNote}
                >
                  <Plus size={16} />
                  New Note
                </CustomButton>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <Card className="h-full">
                    <CardHeader className="pb-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                          placeholder="Search notes..."
                          className="pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="py-10 text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medsync-600 mx-auto"></div>
                          <p className="mt-4 text-gray-500">Loading notes...</p>
                        </div>
                      ) : filteredNotes.length > 0 ? (
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                          {filteredNotes.map((note) => (
                            <div 
                              key={note.id}
                              className={`
                                p-3 rounded-md cursor-pointer border
                                ${activeNote?.id === note.id 
                                  ? 'bg-medsync-50 border-medsync-200 dark:bg-medsync-900/10 dark:border-medsync-800' 
                                  : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700'
                                }
                              `}
                              onClick={() => handleNoteClick(note)}
                            >
                              <h3 className="font-medium truncate">{note.title}</h3>
                              <p className="text-gray-500 text-sm mt-1 line-clamp-2">{note.content}</p>
                              <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                                <span>Updated: {formatDate(note.updated_at)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 text-center">
                          <FileText className="h-12 w-12 mx-auto text-gray-400" />
                          <h3 className="mt-4 text-lg font-medium">No notes found</h3>
                          <p className="mt-1 text-gray-500">
                            {searchTerm 
                              ? `No results for "${searchTerm}"`
                              : "Get started by creating your first note"}
                          </p>
                          {!searchTerm && (
                            <CustomButton
                              variant="primary"
                              size="md"
                              className="mt-4"
                              onClick={handleCreateNote}
                            >
                              <Plus className="mr-2 h-4 w-4" /> Create Note
                            </CustomButton>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <div className="md:col-span-2">
                  <Card className="h-full flex flex-col">
                    <CardHeader className="pb-3 flex-shrink-0">
                      {activeNote ? (
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            {editMode ? (
                              <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="text-xl font-bold"
                                placeholder="Note Title"
                              />
                            ) : (
                              <CardTitle>{activeNote.title}</CardTitle>
                            )}
                            <CardDescription className="mt-1">
                              {!editMode && `Last updated: ${formatDate(activeNote.updated_at)}`}
                            </CardDescription>
                          </div>
                          <div className="flex space-x-2">
                            {editMode ? (
                              <CustomButton
                                variant="primary"
                                size="sm"
                                onClick={handleSaveNote}
                                disabled={isSaving}
                                className="gap-2"
                              >
                                {isSaving ? 'Saving...' : (
                                  <>
                                    <Save className="h-4 w-4" />
                                    Save
                                  </>
                                )}
                              </CustomButton>
                            ) : (
                              <CustomButton
                                variant="outline"
                                size="sm"
                                onClick={() => setEditMode(true)}
                                className="gap-2"
                              >
                                <Edit2 className="h-4 w-4" />
                                Edit
                              </CustomButton>
                            )}
                            <CustomButton
                              variant="destructive"
                              size="sm"
                              onClick={handleDeleteNote}
                              className="gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </CustomButton>
                          </div>
                        </div>
                      ) : (
                        <CardTitle>Select or create a note</CardTitle>
                      )}
                    </CardHeader>
                    <CardContent className="flex-grow">
                      {activeNote ? (
                        editMode ? (
                          <Textarea 
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="min-h-[50vh] resize-none"
                            placeholder="Note content..."
                          />
                        ) : (
                          <div className="whitespace-pre-line min-h-[50vh]">
                            {activeNote.content}
                          </div>
                        )
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          <p>No note selected</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Notes;
