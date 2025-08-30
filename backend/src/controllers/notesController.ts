import { Request, Response } from "express";
import prisma from "../config/database";
import { CreateNoteInput, UpdateNoteInput } from "../types/notes";

export class NotesController {
  //Get all user Notes
  static async getNotes(req: Request, res: Response) {
    try {
      const userId = req.user!.id;

      const notes = await prisma.note.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
      });

      res.json({
        success: true,
        data: { notes },
      });
    } catch (error) {
      console.error("Get notes error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch notes",
      });
    }
  }

  //create new note
  static async createNote(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { title, content }: CreateNoteInput = req.body;

      //validate input
      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Title is Reqired",
        });
      }

      if (!content || !content.trim()) {
        return res.status(400).json({
          success: false,
          message: "Content is Reqired",
        });
      }

      //create new note
      const note = await prisma.note.create({
        data: {
          title: title.trim(),
          content: content.trim(),
          userId,
        },
      });

      res.status(201).json({
        success: true,
        message: "Note created successfully",
        data: { note },
      });
    } catch (error) {
      console.error("Create note error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create note",
      });
    }
  }

  // Update note
  static async updateNote(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const noteId = req.params.id;
      const { title, content }: UpdateNoteInput = req.body;

      // Check if note exists and belongs to user
      const existingNote = await prisma.note.findFirst({
        where: {
          id: noteId,
          userId,
        },
      });

      if (!existingNote) {
        return res.status(404).json({
          success: false,
          message: "Note not found",
        });
      }

      // Update note
      const note = await prisma.note.update({
        where: { id: noteId },
        data: {
          ...(title && { title: title.trim() }),
          ...(content && { content: content.trim() }),
        },
      });

      res.json({
        success: true,
        message: "Note updated successfully",
        data: { note },
      });
    } catch (error) {
      console.error("Update note error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update note",
      });
    }
  }

  //delete Note
  static async deleteNote(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const noteId = req.params.id;

      //check if note exists and belongs to user or not
      const existingNote = await prisma.note.findFirst({
        where: {
          id: noteId,
          userId,
        },
      });

      if (!existingNote) {
        return res.status(404).json({
          success: false,
          message: "Note not found",
        });
      }

      await prisma.note.delete({
        where: {
          id: noteId,
        },
      });

      res.json({
        success: true,
        message: "noe deleted successfully",
      });
    } catch (error) {
      console.error("Delete note error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete note",
      });
    }
  }
}
