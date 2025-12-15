import React, { useState, useEffect } from 'react';
import { MessageSquare, Heart, Share2, User, Send, Users, Star, Image as ImageIcon, Circle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../utils/api';

const Community = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('feed');
    const [posts, setPosts] = useState([]);
    const [clubs, setClubs] = useState([]);
    const [members, setMembers] = useState([]);
    const [newPost, setNewPost] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [selectedClub, setSelectedClub] = useState(null);

    const [expandedPostId, setExpandedPostId] = useState(null);
    const [comments, setComments] = useState({}); // Map: postId -> array of comments
    const [loadingComments, setLoadingComments] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null); // commentId we are replying to

    useEffect(() => {
        let interval;
        if (expandedPostId) {
            fetchComments(expandedPostId, false); // Fetch immediately
            interval = setInterval(() => {
                fetchComments(expandedPostId, false);
            }, 2000); // Poll every 2 seconds
        }
        return () => clearInterval(interval);
    }, [expandedPostId]);

    // Helpers for Nested Comments
    const buildCommentTree = (flatComments) => {
        const commentMap = {};
        const roots = [];

        flatComments.forEach(c => {
            commentMap[c.id] = { ...c, children: [] };
        });

        flatComments.forEach(c => {
            if (c.parentId && commentMap[c.parentId]) {
                commentMap[c.parentId].children.push(commentMap[c.id]);
            } else {
                roots.push(commentMap[c.id]);
            }
        });
        return roots;
    };

    const handleComment = async (postId, content, parentId = null) => {
        if (!content.trim()) return;

        // Optimistic Update
        const tempComment = {
            id: Date.now(), // temporary ID
            userName: user?.name || 'Guest',
            userAvatar: user?.avatar, // Add avatar
            content: content,
            createdAt: new Date().toISOString(),
            parentId: parentId,
            children: [] // Important for tree builder
        };

        // We need to update comments state. 
        // Since we store flat list, we just append.
        setComments(prev => ({
            ...prev,
            [postId]: [...(prev[postId] || []), tempComment]
        }));

        setReplyingTo(null);

        await fetch(`${API_URL}/api/posts/${postId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userName: user?.name || 'Guest',
                userAvatar: user?.avatar,
                content: content,
                parentId: parentId
            }),
        });

        fetchComments(postId, false); // Force fetch to update tree with real ID
    };

    const renderComments = (postId, flatComments) => {
        const roots = buildCommentTree(flatComments);
        return roots.map(root => (
            <CommentItem key={root.id} comment={root} postId={postId} />
        ));
    };

    const CommentItem = ({ comment, postId }) => (
        <div className="mb-2">
            <div className="bg-gray-50 p-3 rounded-lg text-sm group flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                    {comment.userAvatar ? (
                        <img src={comment.userAvatar} alt={comment.userName} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-xs text-muted">
                            {comment.userName[0]}
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="font-bold text-text mr-2">{comment.userName}</span>
                            <span className="text-muted">{comment.content}</span>
                        </div>
                    </div>
                    <div className="mt-1 flex gap-4 text-xs font-bold text-muted">
                        <button
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                            className="hover:text-secondary transition"
                        >
                            Reply
                        </button>
                        <span>{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>
            </div>

            {/* Reply Input */}
            {replyingTo === comment.id && (
                <div className="ml-11 mt-2 mb-2 flex gap-2 animate-in slide-in-from-top-1">
                    <input
                        autoFocus
                        type="text"
                        placeholder={`Replying to ${comment.userName}...`}
                        className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleComment(postId, e.target.value, comment.id);
                                e.target.value = '';
                            }
                        }}
                    />
                    <button onClick={() => setReplyingTo(null)} className="text-xs font-bold text-muted hover:text-text">Cancel</button>
                </div>
            )}

            {/* Nested Children (Ladder) */}
            {comment.children.length > 0 && (
                <div className="ml-4 border-l-2 border-gray-100 pl-4 mt-2">
                    {comment.children.map(child => (
                        <CommentItem key={child.id} comment={child} postId={postId} />
                    ))}
                </div>
            )}
        </div>
    );

    useEffect(() => {
        fetchPosts();
        fetchClubs();
    }, []);

    const fetchPosts = async () => {
        const res = await fetch(`${API_URL}/api/posts`);
        const data = await res.json();
        setPosts(data);
    };

    const fetchClubs = async () => {
        const res = await fetch(`${API_URL}/api/clubs`);
        const data = await res.json();
        setClubs(data);
    };

    const fetchMembers = async (clubId) => {
        const res = await fetch(`${API_URL}/api/clubs/${clubId}/members`);
        const data = await res.json();
        setMembers(data);
    };

    const fetchComments = async (postId, showLoading = true) => {
        if (showLoading) setLoadingComments(true);
        try {
            const res = await fetch(`${API_URL}/api/posts/${postId}/comments`);
            const data = await res.json();
            setComments(prev => ({ ...prev, [postId]: data }));
        } catch (err) {
            console.error(err);
        }
        if (showLoading) setLoadingComments(false);
    };

    const toggleComments = (postId) => {
        if (expandedPostId === postId) {
            setExpandedPostId(null);
        } else {
            setExpandedPostId(postId);
            // Fetching logic moved to useEffect
        }
    };

    const handlePost = async (e) => {
        e.preventDefault();
        if (!newPost.trim()) return;
        await fetch(`${API_URL}/api/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userName: user?.name || 'Guest',
                userAvatar: user?.avatar, // Add avatar
                content: newPost,
                image: imageUrl,
                tags: []
            }),
        });
        setNewPost('');
        setImageUrl('');
        fetchPosts();
    };

    const handleLike = async (id) => {
        await fetch(`${API_URL}/api/posts/${id}/like`, { method: 'POST' });
        fetchPosts();
    };

    const openClub = (club) => {
        setSelectedClub(club);
        fetchMembers(club.id);
        setActiveTab('club_view');
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-text mb-2">Community Hub</h2>
                    <p className="text-muted">Connect, share, and grow together.</p>
                </div>
                <div className="bg-white p-1 rounded-xl border border-gray-200 flex">
                    <button onClick={() => setActiveTab('feed')} className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'feed' ? 'bg-secondary text-white shadow-md' : 'text-muted hover:bg-gray-50'}`}>Feed</button>
                    <button onClick={() => setActiveTab('clubs')} className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'clubs' || activeTab === 'club_view' ? 'bg-secondary text-white shadow-md' : 'text-muted hover:bg-gray-50'}`}>Clubs</button>
                </div>
            </div>

            {activeTab === 'feed' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Create Post */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <form onSubmit={handlePost}>
                                <textarea
                                    className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary outline-none resize-none transition mb-3"
                                    rows="3"
                                    placeholder={`What's on your mind, ${user?.name?.split(' ')[0] || 'Guest'}?`}
                                    value={newPost}
                                    onChange={(e) => setNewPost(e.target.value)}
                                ></textarea>
                                <div className="flex justify-between items-center">
                                    <div className="flex-1 mr-4">
                                        <input
                                            type="text"
                                            placeholder="Image URL (optional)..."
                                            className="w-full px-4 py-2 bg-gray-50 rounded-lg text-sm border-none focus:ring-2 focus:ring-primary outline-none"
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                        />
                                    </div>
                                    <button type="submit" className="px-6 py-2 bg-secondary text-white font-bold rounded-lg hover:bg-secondary/90 transition shadow-lg shadow-secondary/20 flex items-center gap-2">
                                        <Send className="w-4 h-4" /> Post
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Posts */}
                        {posts.map((post) => (
                            <div key={post.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                        {post.userAvatar ? (
                                            <img src={post.userAvatar} alt={post.userName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-bold text-muted">
                                                {post.userName[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-bold text-text">{post.userName}</div>
                                        <div className="text-xs text-muted">{new Date(post.createdAt).toLocaleTimeString()}</div>
                                    </div>
                                </div>
                                <p className="text-text mb-4 leading-relaxed">{post.content}</p>
                                {post.image && (
                                    <img src={post.image} alt="Post" className="w-full h-64 object-cover rounded-xl mb-4" />
                                )}
                                <div className="flex items-center gap-6 text-muted text-sm font-medium border-t border-gray-50 pt-4">
                                    <button onClick={() => handleLike(post.id)} className="flex items-center gap-2 hover:text-bad transition">
                                        <Heart className={`w-4 h-4 ${post.likes > 0 ? 'fill-bad text-bad' : ''}`} /> {post.likes}
                                    </button>
                                    <button
                                        onClick={() => toggleComments(post.id)}
                                        className="flex items-center gap-2 hover:text-secondary transition"
                                    >
                                        <MessageSquare className="w-4 h-4" /> Comment
                                    </button>
                                </div>

                                {/* Comments Section */}
                                {expandedPostId === post.id && (
                                    <div className="mt-4 pt-4 border-t border-gray-50 animate-in fade-in slide-in-from-top-2">
                                        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
                                            {loadingComments ? (
                                                <div className="text-xs text-muted text-center py-2">Loading comments...</div>
                                            ) : comments[post.id]?.length > 0 ? (
                                                renderComments(post.id, comments[post.id])
                                            ) : (
                                                <div className="text-xs text-muted text-center py-2 italic">No comments yet. Be the first!</div>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Write a comment..."
                                                className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-sm border-none focus:ring-2 focus:ring-primary outline-none"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleComment(post.id, e.target.value);
                                                        e.target.value = '';
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-primary to-secondary p-6 rounded-2xl text-white shadow-lg">
                            <h3 className="font-bold text-lg mb-2">Weekly Challenge</h3>
                            <p className="text-sm opacity-90 mb-4">Post a picture of your healthy meal with #HealthyEating to win a badge!</p>
                        </div>
                    </div>
                </div>
            ) : activeTab === 'clubs' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clubs.map((club) => (
                        <div key={club.id} onClick={() => openClub(club)} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition group cursor-pointer">
                            <div className="text-4xl mb-4">{club.icon}</div>
                            <h3 className="font-bold text-xl mb-2 group-hover:text-secondary transition">{club.name}</h3>
                            <p className="text-muted text-sm mb-6 h-10">{club.description}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold bg-gray-100 px-3 py-1 rounded-full text-muted flex items-center gap-1">
                                    <Users className="w-3 h-3" /> {club.members}
                                </span>
                                <span className="text-secondary font-bold text-sm">View Club →</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Club View */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="text-6xl">{selectedClub?.icon}</div>
                                <div>
                                    <h2 className="text-3xl font-bold text-text">{selectedClub?.name}</h2>
                                    <p className="text-muted">{selectedClub?.description}</p>
                                </div>
                            </div>
                            <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center text-muted italic">
                                Club Feed Coming Soon...
                            </div>
                        </div>
                    </div>

                    {/* Members List */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-secondary" /> Members
                        </h3>
                        <div className="space-y-3">
                            {members.map((m, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-xs text-muted">
                                            {m.name[0]}
                                        </div>
                                        <span className="font-medium text-sm">{m.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Circle className={`w-2 h-2 ${m.status === 'online' ? 'fill-ok text-ok' : 'fill-gray-300 text-gray-300'}`} />
                                        <span className="text-xs text-muted capitalize">{m.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Community;
