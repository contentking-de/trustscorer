"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Author {
  id: string;
  name: string;
  email: string | null;
  bio: string | null;
  verified: boolean;
  verifiedAt: string | null;
  createdAt: string;
  _count: {
    certifications: number;
  };
}

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
  });

  useEffect(() => {
    fetchAuthors();
  }, []);

  async function fetchAuthors() {
    try {
      const res = await fetch("/api/authors");
      const data = await res.json();
      setAuthors(data.authors || []);
    } catch {
      setError("Fehler beim Laden der Autoren");
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setFormData({ name: "", email: "", bio: "" });
    setEditingAuthor(null);
    setShowForm(false);
  }

  function handleEdit(author: Author) {
    setFormData({
      name: author.name,
      email: author.email || "",
      bio: author.bio || "",
    });
    setEditingAuthor(author);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (editingAuthor) {
      setIsSaving(true);
      try {
        const res = await fetch("/api/authors", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingAuthor.id, ...formData }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error);
          return;
        }

        setSuccess("Autor aktualisiert");
        resetForm();
        fetchAuthors();
      } catch {
        setError("Fehler beim Aktualisieren des Autors");
      } finally {
        setIsSaving(false);
      }
    } else {
      setIsAdding(true);
      try {
        const res = await fetch("/api/authors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error);
          return;
        }

        setSuccess("Autor hinzugefügt");
        resetForm();
        fetchAuthors();
      } catch {
        setError("Fehler beim Hinzufügen des Autors");
      } finally {
        setIsAdding(false);
      }
    }
  }

  async function handleDelete(authorId: string, certCount: number) {
    const message = certCount > 0
      ? `Dieser Autor hat ${certCount} Zertifizierung(en). Beim Löschen wird der Autor von diesen Zertifizierungen entfernt. Fortfahren?`
      : "Autor wirklich löschen?";

    if (!confirm(message)) {
      return;
    }

    try {
      const res = await fetch(`/api/authors?id=${authorId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
        return;
      }

      setSuccess("Autor gelöscht");
      fetchAuthors();
    } catch {
      setError("Fehler beim Löschen des Autors");
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Autoren</h1>
        <p className="text-gray-500 mt-1">
          Verwalte die Autoren, die du bei Zertifizierungen angeben kannst
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700">
          {success}
        </div>
      )}

      {/* Add/Edit Author Form */}
      {showForm ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingAuthor ? "Autor bearbeiten" : "Neuen Autor hinzufügen"}</CardTitle>
            <CardDescription>
              {editingAuthor
                ? "Bearbeite die Informationen des Autors"
                : "Füge einen neuen Autor hinzu, den du bei Zertifizierungen angeben kannst"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <Input
                  type="text"
                  placeholder="Max Mustermann"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-Mail (optional)
                </label>
                <Input
                  type="email"
                  placeholder="autor@beispiel.de"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio (optional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  rows={3}
                  placeholder="Kurze Beschreibung des Autors..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit" isLoading={isAdding || isSaving}>
                  {editingAuthor ? "Speichern" : "Hinzufügen"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Abbrechen
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <Button onClick={() => setShowForm(true)}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Autor hinzufügen
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Authors List */}
      <Card>
        <CardHeader>
          <CardTitle>Deine Autoren</CardTitle>
        </CardHeader>
        <CardContent>
          {authors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p>Noch keine Autoren angelegt</p>
              <p className="text-sm mt-1">Füge Autoren hinzu, um sie bei Zertifizierungen anzugeben</p>
            </div>
          ) : (
            <div className="space-y-4">
              {authors.map((author) => (
                <div
                  key={author.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-700 font-medium">
                          {author.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{author.name}</p>
                        {author.email && (
                          <p className="text-sm text-gray-500">{author.email}</p>
                        )}
                        {author.bio && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{author.bio}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span>{author._count.certifications} Zertifizierung(en)</span>
                          <span>Erstellt am {new Date(author.createdAt).toLocaleDateString("de-DE")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(author)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(author.id, author._count.certifications)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
