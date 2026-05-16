import React, { useState, useEffect } from 'react';
import { 
  Code2, 
  Terminal, 
  Bug, 
  LayoutTemplate as Template, 
  BookOpen, 
  Plus, 
  Trash2, 
  ChevronRight, 
  Search,
  ExternalLink,
  Github,
  Moon,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

interface Snippet {
  id: number;
  title: string;
  content: string;
  language: string;
  tags: string;
}

interface DevTemplate {
  id: string;
  name: string;
  description: string;
  lang: string;
}

// --- API Helpers ---

const API = {
  fetchSnippets: async () => (await fetch('/api/snippets')).json(),
  createSnippet: async (s: any) => fetch('/api/snippets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(s)
  }).then(r => r.json()),
  deleteSnippet: async (id: number) => fetch(`/api/snippets/${id}`, { method: 'DELETE' }),
  debugError: async (errorMessage: string, context: string) => fetch('/api/debug', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ errorMessage, context })
  }).then(r => r.json()),
  fetchTemplates: async () => (await fetch('/api/templates')).json(),
};

// --- Views ---

const DashboardHome = ({ setView }: { setView: (v: string) => void }) => (
  <div className="space-y-6">
    <div className="p-6 bg-brand/10 border-l-4 border-brand bg-slate-900">
      <h1 className="text-2xl font-black uppercase tracking-tighter text-white mb-1">Happy Coding, <span className="text-brand">Dev!</span></h1>
      <p className="text-slate-400 text-[10px] uppercase font-mono tracking-widest">Mobile Development Stack: [TERMINAL_READY]</p>
    </div>

    <div className="grid grid-cols-2 gap-px bg-slate-800 border border-slate-800">
      <MenuCard 
        icon={<Code2 className="text-indigo-400" />} 
        title="Snippets" 
        desc="Library" 
        onClick={() => setView('snippets')}
      />
      <MenuCard 
        icon={<Bug className="text-pink-500" />} 
        title="Debug" 
        desc="Fix errors" 
        onClick={() => setView('debug')}
      />
      <MenuCard 
        icon={<Template className="text-emerald-400" />} 
        title="Templates" 
        desc="New project" 
        onClick={() => setView('templates')}
      />
      <MenuCard 
        icon={<BookOpen className="text-amber-400" />} 
        title="Wiki" 
        desc="Cheats" 
        onClick={() => setView('docs')}
      />
    </div>

    <div className="p-6 card-brutal">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 underline decoration-indigo-600 underline-offset-4">Quick Terminal Utilities</h3>
      </div>
      <div className="space-y-px bg-slate-800">
        <button className="w-full flex items-center justify-between p-4 bg-slate-950 hover:bg-slate-900 transition-colors text-xs font-mono group">
          <div className="flex items-center gap-3">
            <Terminal size={16} className="text-emerald-500" />
            <span className="text-slate-200">bash init_env.sh</span>
          </div>
          <ChevronRight size={14} className="text-slate-600 group-hover:text-indigo-400" />
        </button>
        <button className="w-full flex items-center justify-between p-4 bg-slate-950 hover:bg-slate-900 transition-colors text-xs font-mono group">
          <div className="flex items-center gap-3">
            <Github size={16} className="text-slate-400" />
            <span className="text-slate-200">git remote -v</span>
          </div>
          <ChevronRight size={14} className="text-slate-600 group-hover:text-indigo-400" />
        </button>
      </div>
    </div>
  </div>
);

const MenuCard = ({ icon, title, desc, onClick }: any) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center p-6 bg-slate-950 hover:bg-slate-900 transition-all active:scale-[0.98]"
  >
    <div className="mb-3">{icon}</div>
    <h3 className="font-bold text-xs uppercase text-white tracking-wider">{title}</h3>
    <p className="text-[8px] text-slate-500 uppercase tracking-widest mt-1 font-mono">{desc}</p>
  </button>
);

const SnippetView = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newSnippet, setNewSnippet] = useState({ title: '', content: '', language: 'python' });

  useEffect(() => {
    API.fetchSnippets().then(setSnippets);
  }, []);

  const handleAdd = async () => {
    const saved = await API.createSnippet(newSnippet);
    setSnippets([saved, ...snippets]);
    setShowAdd(false);
    setNewSnippet({ title: '', content: '', language: 'python' });
  };

  const handleDelete = async (id: number) => {
    await API.deleteSnippet(id);
    setSnippets(snippets.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-xs font-black uppercase tracking-widest text-indigo-400">
          📂 System Snippets
        </h2>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="p-1 px-3 bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-widest active:scale-90 transition-transform"
        >
          {showAdd ? 'Cancel' : '+ New'}
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-slate-900 border border-slate-800 space-y-3"
          >
            <input 
              type="text" 
              placeholder="Snippet Title"
              className="w-full bg-slate-950 border border-slate-800 p-2 text-xs font-bold uppercase tracking-tight text-white focus:border-indigo-500 outline-none"
              value={newSnippet.title}
              onChange={e => setNewSnippet({...newSnippet, title: e.target.value})}
            />
            <textarea 
              placeholder="Code Block..."
              rows={4}
              className="w-full bg-slate-950 border border-slate-800 p-2 text-xs font-mono text-slate-300 focus:border-indigo-500 outline-none"
              value={newSnippet.content}
              onChange={e => setNewSnippet({...newSnippet, content: e.target.value})}
            />
            <div className="flex gap-2">
               <select 
                className="bg-slate-800 text-[10px] font-bold uppercase p-2 outline-none border border-slate-700"
                value={newSnippet.language}
                onChange={e => setNewSnippet({...newSnippet, language: e.target.value})}
               >
                 <option value="python">Python</option>
                 <option value="javascript">JS</option>
                 <option value="html">HTML</option>
                 <option value="bash">Bash</option>
               </select>
               <button 
                onClick={handleAdd}
                className="flex-1 bg-white text-black font-black uppercase text-[10px] py-2 tracking-widest"
               >
                 Commit Snippet
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-px bg-slate-800 border border-slate-800">
        {snippets.map(s => (
          <div key={s.id} className="p-4 bg-slate-950 group">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-indigo-500 bg-indigo-500/10 px-1 border border-indigo-500/20">{(s.language || '??').substring(0, 2).toUpperCase()}</span>
                <h4 className="font-bold text-[11px] uppercase tracking-wide text-slate-200">{s.title}</h4>
              </div>
              <button 
                onClick={() => handleDelete(s.id)}
                className="text-slate-700 hover:text-pink-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <pre className="bg-slate-900 p-3 overflow-x-auto text-[10px] text-slate-400 font-mono border-l-2 border-slate-700">
              <code>{s.content}</code>
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};

const DebugView = () => {
  const [errorMsg, setErrorMsg] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleDebug = async () => {
    if (!errorMsg) return;
    setLoading(true);
    try {
      const data = await API.debugError(errorMsg, context);
      setResult(data.explanation);
    } catch (e) {
      setResult("### ⚠️ Error\nFailed to connect to AI server. Check your connection.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4 pb-20">
      <h2 className="text-xs font-black uppercase tracking-widest text-pink-500">
        🚨 Terminal Debugger
      </h2>
      
      <div className="space-y-3">
        <div className="relative">
          <div className="absolute top-2 left-2 text-[8px] font-mono text-slate-600 uppercase">Input Traceback</div>
          <textarea 
            placeholder="[SYSTEM_ERROR]: Paste logs here..."
            rows={5}
            className="w-full bg-slate-900 border border-slate-800 p-4 pt-6 text-[11px] font-mono text-pink-400 focus:border-pink-500/50 outline-none"
            value={errorMsg}
            onChange={e => setErrorMsg(e.target.value)}
          />
        </div>
        <input 
          type="text"
          placeholder="System Environment (e.g. Android 14 / Python 3.11)"
          className="w-full bg-slate-900 border border-slate-800 p-3 text-[10px] font-mono text-slate-300 focus:border-indigo-500 outline-none"
          value={context}
          onChange={e => setContext(e.target.value)}
        />
        <button 
          onClick={handleDebug}
          disabled={loading || !errorMsg}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black uppercase text-xs py-4 tracking-widest transition-all active:scale-95"
        >
          {loading ? "Decrypting Error..." : "Analyze Stack"}
        </button>
      </div>

      {result && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-slate-900 border border-indigo-500/30 font-sans"
        >
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">Logic Analysis Result</span>
            <button onClick={() => setResult(null)} className="text-slate-600 hover:text-white"><X size={14}/></button>
          </div>
          <div className="whitespace-pre-wrap leading-relaxed text-[11px] text-slate-200">
            {result}
          </div>
        </motion.div>
      )}
    </div>
  );
};

const TemplateView = () => {
  const [templates, setTemplates] = useState<DevTemplate[]>([]);
  const [generating, setGenerating] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    API.fetchTemplates().then(setTemplates);
  }, []);

  const handleGenerate = async (id: string) => {
    setGenerating(id);
    const res = await fetch('/api/generate-project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: id })
    });
    const data = await res.json();
    setResult(data);
    setGenerating(null);
  };

  return (
    <div className="space-y-4 pb-20">
      <h2 className="text-xs font-black uppercase tracking-widest text-emerald-500">
        ⚡ Rapid Deploy Templates
      </h2>
      
      {!result ? (
        <div className="grid grid-cols-1 gap-px bg-slate-800 border border-slate-800">
          {templates.map(t => (
            <div key={t.id} className="p-4 bg-slate-950 flex items-center justify-between group">
              <div className="flex-1 pr-4">
                <h4 className="font-bold text-[11px] text-white uppercase tracking-wider group-hover:text-emerald-400 transition-colors">{t.name}</h4>
                <p className="text-[9px] text-slate-500 mt-1 font-mono">{t.description}</p>
              </div>
              <button 
                onClick={() => handleGenerate(t.id)}
                disabled={!!generating}
                className="px-4 py-2 bg-slate-900 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] uppercase active:scale-90 transition-transform"
              >
                {generating === t.id ? "..." : "INST"}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-slate-900 border-l-2 border-emerald-500 space-y-6"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-emerald-500">Manifest Generated</h3>
            <button onClick={() => setResult(null)} className="text-slate-600 hover:text-white"><X size={18}/></button>
          </div>
          
          <div>
            <span className="text-[10px] font-mono text-slate-600 underline uppercase decoration-slate-800">Files to touch</span>
            <div className="mt-3 space-y-2">
              {result.files.map((f: string) => (
                <div key={f} className="flex items-center gap-2 text-[10px] font-mono text-slate-300">
                  <span className="text-emerald-800">{">"}</span>
                  {f}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800">
            <span className="text-[10px] font-mono text-slate-600 underline uppercase decoration-slate-800">Execute Next</span>
            <ul className="mt-3 space-y-4">
              {result.nextSteps.map((s: string, i: number) => (
                <li key={i} className="text-[10px] leading-relaxed text-slate-400 flex gap-3">
                   <span className="text-emerald-500 font-black font-mono">0{i+1}</span>
                   {s}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const CheatSheetView = () => {
  const [search, setSearch] = useState('');
  const commands = [
    { cmd: 'git init', desc: 'New repository', tag: 'git' },
    { cmd: 'pip install <pkg>', desc: 'Install package (Pydroid)', tag: 'python' },
    { cmd: 'apt update && apt upgrade', desc: 'Refresh Termux pkgs', tag: 'termux' },
    { cmd: 'tar -czvf <name>.tar.gz <dir>', desc: 'Compress folder', tag: 'linux' },
    { cmd: 'git pull origin main', desc: 'Sync with remote', tag: 'git' },
    { cmd: 'python -m http.server', desc: 'Quick static server', tag: 'python' }
  ];

  const filtered = commands.filter(c => 
    c.cmd.toLowerCase().includes(search.toLowerCase()) || 
    c.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-20">
      <h2 className="text-xs font-black uppercase tracking-widest text-amber-500">
        📟 Logic Cheatsheet
      </h2>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700" size={14} />
        <input 
          type="text"
          placeholder="SEARCH COMMAND_LOGS..."
          className="w-full bg-slate-950 border border-slate-800 py-3 pl-10 pr-4 text-[10px] font-mono text-slate-300 outline-none focus:border-indigo-600 uppercase tracking-widest"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="space-y-px bg-slate-800 border border-slate-800">
        {filtered.map((c, i) => (
          <div key={i} className="p-4 bg-slate-950 flex flex-col gap-2 group hover:bg-slate-900 transition-colors">
            <div className="flex justify-between items-center">
              <code className="text-[10px] text-amber-500 font-bold group-hover:text-white transition-colors">$ {c.cmd}</code>
              <span className="text-[8px] px-1 bg-slate-900 border border-slate-800 border-slate-700 text-slate-500 uppercase font-mono">{c.tag}</span>
            </div>
            <p className="text-[9px] text-slate-500 uppercase tracking-tighter leading-tight">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [view, setView] = useState('home');

  const renderView = () => {
    switch (view) {
      case 'snippets': return <SnippetView />;
      case 'debug': return <DebugView />;
      case 'templates': return <TemplateView />;
      case 'docs': return <CheatSheetView />;
      default: return <DashboardHome setView={setView} />;
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col max-w-md mx-auto relative border-x border-slate-900 overflow-hidden shadow-2xl">
      {/* Header */}
      <header className="px-6 h-16 flex items-center justify-between border-b border-slate-800 sticky top-0 bg-slate-950/80 backdrop-blur-md z-20">
        <button 
          onClick={() => setView('home')}
          className="flex items-center gap-3"
        >
          <div className="w-8 h-8 bg-indigo-600 flex items-center justify-center font-bold text-white text-[10px]">
            PD
          </div>
          <span className="font-black tracking-tighter text-sm uppercase text-white">PhoneDev <span className="text-indigo-400 italic">Toolkit</span></span>
        </button>
        <button className="text-slate-600 hover:text-white transition-colors">
          <Menu size={18} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="border-t border-slate-800 bg-slate-950 flex justify-around items-center sticky bottom-0 z-20">
        <NavButton active={view === 'home'} icon={<Terminal size={18} />} label="Home" onClick={() => setView('home')} />
        <NavButton active={view === 'snippets'} icon={<Code2 size={18} />} label="Logs" onClick={() => setView('snippets')} />
        <NavButton active={view === 'debug'} icon={<Bug size={18} />} label="Fix" onClick={() => setView('debug')} />
        <NavButton active={view === 'docs'} icon={<BookOpen size={18} />} label="Wiki" onClick={() => setView('docs')} />
      </nav>

      {/* Footer Status Bar */}
      <footer className="h-6 bg-indigo-600 text-white flex items-center justify-between px-6 text-[8px] font-bold uppercase tracking-[0.2em] z-30">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><div className="w-1 h-1 bg-white animate-pulse" /> DEV_ACTIVE</span>
          <span className="text-indigo-200">PORT: 3000</span>
        </div>
        <div className="flex gap-4">
          <span className="opacity-70">V 1.2.0</span>
        </div>
      </footer>
    </div>
  );
}

const NavButton = ({ active, icon, label, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 py-4 w-full transition-all relative ${active ? 'text-indigo-400 bg-slate-900 border-t-2 border-indigo-600 mt-[-2px]' : 'text-slate-600 hover:text-slate-400'}`}
  >
    {icon}
    <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

