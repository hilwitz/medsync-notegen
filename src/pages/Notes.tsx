
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
import { Search, Plus, Save, Trash2, Edit2, FileText, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
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
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to view notes",
          variant: "destructive"
        });
        return;
      }
      
      // Fetch notes from Supabase - use consultations table with note_type="note"
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('user_id', user.id)
        .eq('note_type', 'note')
        .order('updated_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Transform consultation data to match Note interface
      const transformedNotes: Note[] = data?.map(consultation => ({
        id: consultation.id,
        title: consultation.content?.title || 'Untitled Note',
        content: consultation.content?.text || '',
        created_at: consultation.created_at,
        updated_at: consultation.updated_at,
        user_id: consultation.user_id
      })) || [];
      
      setNotes(transformedNotes);
      
      if (transformedNotes.length > 0) {
        setActiveNote(transformedNotes[0]);
        setTitle(transformedNotes[0].title);
        setContent(transformedNotes[0].content);
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
  
  const handleCreateNote = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to create notes",
          variant: "destructive"
        });
        return;
      }
      
      // Create a new note in the consultations table
      const newNote = {
        user_id: user.id,
        note_type: 'note',
        patient_id: '00000000-0000-0000-0000-000000000000', // Using a placeholder UUID
        status: 'completed',
        content: {
          title: 'New Note',
          text: ''
        }
      };
      
      const { data, error } = await supabase
        .from('consultations')
        .insert(newNote)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Transform to Note format
      const transformedNote: Note = {
        id: data.id,
        title: data.content?.title || 'Untitled Note',
        content: data.content?.text || '',
        created_at: data.created_at,
        updated_at: data.updated_at,
        user_id: data.user_id
      };
      
      setNotes([transformedNote, ...notes]);
      setActiveNote(transformedNote);
      setTitle(transformedNote.title);
      setContent(transformedNote.content);
      setEditMode(true);
      
      toast({
        title: "Success",
        description: "New note created",
      });
    } catch (error) {
      console.error('Error creating note:', error);
      toast({
        title: "Error",
        description: "Failed to create note",
        variant: "destructive"
      });
    }
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
      // Update the consultation with the note content
      const { data, error } = await supabase
        .from('consultations')
        .update({
          content: {
            title: title,
            text: content
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', activeNote.id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Transform updated data to Note format
      const updatedNote: Note = {
        id: data.id,
        title: data.content?.title || 'Untitled Note',
        content: data.content?.text || '',
        created_at: data.created_at,
        updated_at: data.updated_at,
        user_id: data.user_id
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
  
  const openDeleteDialog = () => {
    if (!activeNote) return;
    setShowDeleteDialog(true);
  };
  
  const handleDeleteNote = async () => {
    if (!activeNote) return;
    
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('consultations')
        .delete()
        .eq('id', activeNote.id);
      
      if (error) {
        throw error;
      }
      
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
      setShowDeleteDialog(false);
      
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
        
        <SidebarInset className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950">
          <div className="container px-4 py-8">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Notes</h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Manage your clinical notes and references
                  </p>
                </div>
                
                <CustomButton 
                  variant="primary" 
                  size="md"
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  onClick={handleCreateNote}
                >
                  <Plus size={16} />
                  New Note
                </CustomButton>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <Card className="h-full shadow-md hover:shadow-lg transition-shadow duration-300 border-indigo-100 dark:border-indigo-900">
                    <CardHeader className="pb-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                          placeholder="Search notes..."
                          className="pl-10 border-indigo-200 focus:border-indigo-400 dark:border-indigo-800"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="py-10 text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                          <p className="mt-4 text-gray-500">Loading notes...</p>
                        </div>
                      ) : filteredNotes.length > 0 ? (
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                          {filteredNotes.map((note) => (
                            <div 
                              key={note.id}
                              className={`
                                p-3 rounded-md cursor-pointer border transition-all duration-200
                                ${activeNote?.id === note.id 
                                  ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-800' 
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
                          <FileText className="h-12 w-12 mx-auto text-indigo-400 opacity-50" />
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
                              className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-600"
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
                  <Card className="h-full flex flex-col shadow-md hover:shadow-lg transition-shadow duration-300 border-indigo-100 dark:border-indigo-900">
                    <CardHeader className="pb-3 flex-shrink-0">
                      {activeNote ? (
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            {editMode ? (
                              <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="text-xl font-bold border-indigo-200 focus:border-indigo-400"
                                placeholder="Note Title"
                              />
                            ) : (
                              <CardTitle className="text-xl font-bold">{activeNote.title}</CardTitle>
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
                                className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600"
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
                                className="gap-2 border-indigo-200 hover:bg-indigo-50"
                              >
                                <Edit2 className="h-4 w-4" />
                                Edit
                              </CustomButton>
                            )}
                            <CustomButton
                              variant="destructive"
                              size="sm"
                              onClick={openDeleteDialog}
                              className="gap-2 bg-red-500 hover:bg-red-600"
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
                            className="min-h-[50vh] resize-none border-indigo-200 focus:border-indigo-400"
                            placeholder="Note content..."
                          />
                        ) : (
                          <div className="whitespace-pre-line min-h-[50vh] prose prose-indigo max-w-none">
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
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{activeNote?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteNote}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
};

export default Notes;
