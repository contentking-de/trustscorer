"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Domain {
  id: string;
  domain: string;
}

interface Author {
  id: string;
  name: string;
  email: string | null;
  bio: string | null;
  imageUrl: string | null;
  verified: boolean;
  verifiedAt: string | null;
  createdAt: string;
  domains: Domain[];
  _count: {
    certifications: number;
  };
}

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [verifiedDomains, setVerifiedDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    domainIds: [] as string[],
  });

  useEffect(() => {
    fetchAuthors();
    fetchDomains();
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

  async function fetchDomains() {
    try {
      const res = await fetch("/api/domains");
      const data = await res.json();
      // Filter only verified domains
      const verified = (data.domains || []).filter(
        (d: { verificationStatus: string }) => d.verificationStatus === "VERIFIED"
      );
      setVerifiedDomains(verified);
    } catch {
      // Silently fail, domains will just be empty
    }
  }

  function resetForm() {
    setFormData({ name: "", email: "", bio: "", domainIds: [] });
    setEditingAuthor(null);
    setShowForm(false);
    setPreviewImage(null);
    setSelectedFile(null);
  }

  function handleEdit(author: Author) {
    setFormData({
      name: author.name,
      email: author.email || "",
      bio: author.bio || "",
      domainIds: author.domains.map((d) => d.id),
    });
    setEditingAuthor(author);
    setPreviewImage(author.imageUrl);
    setSelectedFile(null);
    setShowForm(true);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Nur JPEG, PNG, WebP und GIF Bilder sind erlaubt");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Maximale Dateigröße ist 5MB");
      return;
    }

    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
    setError("");
  }

  async function uploadImage(authorId: string): Promise<string | null> {
    if (!selectedFile) return editingAuthor?.imageUrl || null;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("authorId", authorId);

      const res = await fetch("/api/authors/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      return data.imageUrl;
    } catch (err) {
      console.error("Upload error:", err);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDeleteImage(authorId: string) {
    if (!confirm("Profilbild wirklich löschen?")) return;

    try {
      const res = await fetch(`/api/authors/upload?authorId=${authorId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
        return;
      }

      setSuccess("Profilbild gelöscht");
      setPreviewImage(null);
      fetchAuthors();
    } catch {
      setError("Fehler beim Löschen des Profilbilds");
    }
  }

  function toggleDomain(domainId: string) {
    setFormData((prev) => ({
      ...prev,
      domainIds: prev.domainIds.includes(domainId)
        ? prev.domainIds.filter((id) => id !== domainId)
        : [...prev.domainIds, domainId],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (editingAuthor) {
      setIsSaving(true);
      try {
        // First update the author data
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

        // Then upload image if selected
        if (selectedFile) {
          try {
            await uploadImage(editingAuthor.id);
          } catch {
            setError("Autor aktualisiert, aber Bild-Upload fehlgeschlagen");
            resetForm();
            fetchAuthors();
            return;
          }
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
        // First create the author
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

        // Then upload image if selected
        if (selectedFile && data.author?.id) {
          try {
            await uploadImage(data.author.id);
          } catch {
            setError("Autor erstellt, aber Bild-Upload fehlgeschlagen");
            resetForm();
            fetchAuthors();
            return;
          }
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
              {/* Profile Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profilbild (optional)
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {previewImage ? (
                      <div className="relative">
                        <img
                          src={previewImage}
                          alt="Vorschau"
                          className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (editingAuthor?.imageUrl && previewImage === editingAuthor.imageUrl) {
                              handleDeleteImage(editingAuthor.id);
                            } else {
                              setPreviewImage(editingAuthor?.imageUrl || null);
                              setSelectedFile(null);
                            }
                          }}
                          className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="cursor-pointer">
                      <span className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Bild auswählen
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP oder GIF. Max. 5MB</p>
                  </div>
                </div>
              </div>

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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Domains *
                </label>
                {verifiedDomains.length === 0 ? (
                  <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                    Du musst zuerst mindestens eine Domain verifizieren, bevor du Autoren anlegen kannst.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {verifiedDomains.map((domain) => (
                      <label
                        key={domain.id}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          formData.domainIds.includes(domain.id)
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.domainIds.includes(domain.id)}
                          onChange={() => toggleDomain(domain.id)}
                          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <span className="text-gray-900">{domain.domain}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button 
                  type="submit" 
                  isLoading={isAdding || isSaving || isUploading}
                  disabled={formData.domainIds.length === 0 || verifiedDomains.length === 0}
                >
                  {isUploading ? "Bild wird hochgeladen..." : editingAuthor ? "Speichern" : "Hinzufügen"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} disabled={isAdding || isSaving || isUploading}>
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
                      {author.imageUrl ? (
                        <img
                          src={author.imageUrl}
                          alt={author.name}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-emerald-700 font-medium">
                            {author.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{author.name}</p>
                        {author.email && (
                          <p className="text-sm text-gray-500">{author.email}</p>
                        )}
                        {author.bio && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{author.bio}</p>
                        )}
                        {author.domains.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {author.domains.map((domain) => (
                              <span
                                key={domain.id}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                              >
                                {domain.domain}
                              </span>
                            ))}
                          </div>
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
