// src/hooks/useNotes.js
import { useState, useEffect } from "react";

export function useNotes(storageKey) {
	const [notes, setNotes] = useState("");
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		try {
			const storedNote = window.localStorage.getItem(storageKey);
			setNotes(storedNote !== null ? storedNote : "");
			setIsLoaded(true);
		} catch (error) {
			console.warn("Error reading localStorage", error);
			setIsLoaded(true);
		}
	}, [storageKey]);

	const saveNote = (newNote) => {
		setNotes(newNote);
		try {
			// If the user clears the text box manually, let's just delete the key to save space
			if (newNote.trim() === "") {
				window.localStorage.removeItem(storageKey);
			} else {
				window.localStorage.setItem(storageKey, newNote);
			}
			window.dispatchEvent(new Event("notes-updated"));
		} catch (error) {
			console.warn("Error setting localStorage", error);
		}
	};

	// NEW: Dedicated delete function
	const deleteNote = () => {
		setNotes("");
		try {
			window.localStorage.removeItem(storageKey);
			window.dispatchEvent(new Event("notes-updated"));
		} catch (error) {
			console.warn("Error removing from localStorage", error);
		}
	};

	return { notes, saveNote, deleteNote, isLoaded };
}
