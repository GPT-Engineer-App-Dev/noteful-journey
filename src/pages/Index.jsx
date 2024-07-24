import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash, LogIn, LogOut } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Draggable from 'react-draggable';

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

  useEffect(() => {
    const storedNotes = localStorage.getItem('notes');
    if (storedNotes) {
      setNotes(JSON.parse(storedNotes));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  const handleLogin = () => {
    if (username === 'user' && password === 'pass') {
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentNote) {
      setNotes(notes.map(note => 
        note.id === currentNote.id 
          ? {...note, title, content, color, tags: tags.split(',').map(tag => tag.trim())} 
          : note
      ));
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
      setNotes([...notes, newNote]);
    }
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
    setNotes(notes.filter(note => note.id !== id));
  };

  const addComment = (noteId) => {
    if (comment.trim()) {
      setNotes(notes.map(note => 
        note.id === noteId 
          ? {...note, comments: [...note.comments, comment]} 
          : note
      ));
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

  const handleDrag = (id, e, data) => {
    setNotes(notes.map(note =>
      note.id === id ? { ...note, position: { x: data.x, y: data.y } } : note
    ));
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

      <div className="mt-8 relative" style={{ height: '600px', overflow: 'hidden' }}>
        {notes.map(note => (
          <Draggable
            key={note.id}
            defaultPosition={note.position}
            onStop={(e, data) => handleDrag(note.id, e, data)}
            bounds="parent"
          >
            <div className="absolute">
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
          </Draggable>
        ))}
      </div>
    </div>
  );
};

export default Index;