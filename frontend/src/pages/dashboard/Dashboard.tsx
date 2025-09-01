import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { notesService } from "../../services/api";
import type { Note, CreateNoteData } from "../../types";
import { LoadingSpinner, HDLogo } from "../../components/ui";
import NoteCard from "../../components/notes/NoteCard";
import CreateNoteModal from "../../components/notes/CreateNoteModal";

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch user notes on component mount
  useEffect(() => {
    fetchNotes();
  }, []);

  // Fetch all user notes from backend
  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await notesService.getNotes();

      if (response.success && response.data) {
        setNotes(response.data.notes);
      } else {
        setError("Failed to load notes");
      }
    } catch (err: any) {
      console.error("Fetch notes error:", err);
      setError("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  // Create new note
  const handleCreateNote = async (noteData: CreateNoteData) => {
    try {
      const response = await notesService.createNote(noteData);

      if (response.success && response.data) {
        // Add new note to the list
        setNotes((prev) => [response.data!.note, ...prev]);
        setShowCreateModal(false);
      } else {
        setError("Failed to create note");
      }
    } catch (err: any) {
      console.error("Create note error:", err);
      setError("Failed to create note");
    }
  };

  // Delete note
  const handleDeleteNote = async (noteId: string) => {
    try {
      const response = await notesService.deleteNote(noteId);

      if (response.success) {
        // Remove note from the list
        setNotes((prev) => prev.filter((note) => note.id !== noteId));
      } else {
        setError("Failed to delete note");
      }
    } catch (err: any) {
      console.error("Delete note error:", err);
      setError("Failed to delete note");
    }
  };

  // Update note
  const handleUpdateNote = async (noteId: string, updates: Partial<Note>) => {
    try {
      const response = await notesService.updateNote(noteId, updates);

      if (response.success && response.data) {
        // Update note in the list
        setNotes((prev) =>
          prev.map((note) => (note.id === noteId ? response.data!.note : note))
        );
      } else {
        setError("Failed to update note");
      }
    } catch (err: any) {
      console.error("Update note error:", err);
      setError("Failed to update note");
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <HDLogo />

            {/* User Info & Logout */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                <p className="text-sm text-gray-700">
                  Welcome, <span className="font-medium">{user?.name}</span>
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>

              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome, {user?.name}! 👋
          </h1>
          <p className="text-gray-600">Here are your notes</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Create Note Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Create New Note
          </button>
        </div>

        {/* Notes Grid */}
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No notes yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first note to get started
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Create your first note →
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onDelete={handleDeleteNote}
                onUpdate={handleUpdateNote}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create Note Modal */}
      {showCreateModal && (
        <CreateNoteModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateNote}
        />
      )}
    </div>
  );
};

export default Dashboard;
