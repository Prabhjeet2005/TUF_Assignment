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
			window.localStorage.setItem(storageKey, newNote);
			window.dispatchEvent(new Event("notesUpdated"));
		} catch (error) {
			console.warn("Error setting localStorage", error);
		}
	};

	return { notes, saveNote, isLoaded };
}
