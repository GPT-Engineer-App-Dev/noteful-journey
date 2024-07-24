import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash, LogIn, LogOut, Camera } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Index = () => {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#ffffff');
  const [tags, setTags] = useState('');
  const [comment, setComment] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [draggedNote, setDraggedNote] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const storedNotes = localStorage.getItem('notes');
    const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
    if (storedNotes) {
      setNotes(JSON.parse(storedNotes));
    }
    if (storedIsLoggedIn) {
      setIsLoggedIn(JSON.parse(storedIsLoggedIn));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('isLoggedIn', JSON.stringify(isLoggedIn));
  }, [isLoggedIn]);

  const handleLogin = () => {
    if (username === 'user' && password === 'pass') {
      setIsLoggedIn(true);
      setError('');
      localStorage.setItem('isLoggedIn', 'true');
    } else {
      setError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    localStorage.setItem('isLoggedIn', 'false');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let updatedNotes;
    if (currentNote) {
      updatedNotes = notes.map(note => 
        note.id === currentNote.id 
          ? {...note, title, content, color, tags: tags.split(',').map(tag => tag.trim())} 
          : note
      );
    } else {
      const newNote = {
        id: Date.now(),
        title,
        content,
        color,
        tags: tags.split(',').map(tag => tag.trim()),
        comments: [],
        createdAt: new Date().toISOString().split('T')[0],
        position: { x: 0, y: 0 }
      };
      updatedNotes = [...notes, newNote];
    }
    setNotes(updatedNotes);
    localStorage.setItem('notes', JSON.stringify(updatedNotes));
    resetForm();
  };

  const resetForm = () => {
    setCurrentNote(null);
    setTitle('');
    setContent('');
    setColor('#ffffff');
    setTags('');
  };

  const editNote = (note) => {
    setCurrentNote(note);
    setTitle(note.title);
    setContent(note.content);
    setColor(note.color);
    setTags(note.tags.join(', '));
  };

  const deleteNote = (id) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    localStorage.setItem('notes', JSON.stringify(updatedNotes));
  };

  const addComment = (noteId) => {
    if (comment.trim()) {
      const updatedNotes = notes.map(note => 
        note.id === noteId 
          ? {...note, comments: [...note.comments, comment]} 
          : note
      );
      setNotes(updatedNotes);
      localStorage.setItem('notes', JSON.stringify(updatedNotes));
      setComment('');
    }
  };

  const getNotesPerDay = () => {
    const counts = {};
    notes.forEach(note => {
      counts[note.createdAt] = (counts[note.createdAt] || 0) + 1;
    });
    return Object.keys(counts).map(date => ({ date, count: counts[date] }));
  };

  const handleDragStart = (e, note) => {
    setDraggedNote(note);
    e.dataTransfer.setData('text/plain', note.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (draggedNote) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const updatedNotes = notes.map(note =>
        note.id === draggedNote.id ? { ...note, position: { x, y } } : note
      );
      setNotes(updatedNotes);
      localStorage.setItem('notes', JSON.stringify(updatedNotes));
      setDraggedNote(null);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-96">
          <CardHeader>Login</CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button type="submit" className="w-full">
                <LogIn className="mr-2 h-4 w-4" /> Login
              </Button>
              {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Notes App</h1>
        <Button onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>{currentNote ? 'Edit Note' : 'Add Note'}</CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <Textarea
                placeholder="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
              <Input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
              <Input
                type="text"
                placeholder="Tags (comma-separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <Button type="submit">
                {currentNote ? <Edit className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                {currentNote ? 'Update Note' : 'Add Note'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>Notes Graph</CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getNotesPerDay()}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div 
        ref={canvasRef}
        className="mt-8 relative" 
        style={{ height: '600px', overflow: 'hidden' }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {notes.map(note => (
          <div
            key={note.id}
            className="absolute"
            style={{
              left: `${note.position.x}px`,
              top: `${note.position.y}px`,
              cursor: 'move'
            }}
            draggable
            onDragStart={(e) => handleDragStart(e, note)}
          >
            <Card style={{backgroundColor: note.color, width: '300px'}}>
              <CardHeader>{note.title}</CardHeader>
              <CardContent>
                <p>{note.content}</p>
                <div className="mt-2">
                  {note.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="mr-1">{tag}</Badge>
                  ))}
                </div>
                <div className="mt-4">
                  <h4 className="font-semibold">Comments:</h4>
                  {note.comments.map((comment, index) => (
                    <p key={index} className="text-sm">{comment}</p>
                  ))}
                  <div className="mt-2 flex">
                    <Input
                      type="text"
                      placeholder="Add a comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="mr-2"
                    />
                    <Button onClick={() => addComment(note.id)}>Add</Button>
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <Button onClick={() => editNote(note)} variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => deleteNote(note.id)} variant="destructive">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Placeholder image example */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Placeholder Image Example</h2>
        <div className="bg-gray-200 p-4 rounded-lg">
          <img src="/placeholder.svg" alt="placeholder" className="mx-auto object-cover w-full h-[400px]" />
        </div>
      </div>

      {/* Example of using Lucide icon */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Lucide Icon Example</h2>
        <Camera color="red" size={48} />
      </div>
    </div>
  );
};

export default Index;