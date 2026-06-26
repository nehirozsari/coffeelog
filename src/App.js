import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "coffee-tin-log";

const StarRating = ({ value, onChange }) => (
  <div style={{ display: "flex", gap: 4 }}>
    {[1,2,3,4,5].map(s => (
      <span
        key={s}
        onClick={() => onChange && onChange(s)}
        style={{
          fontSize: 24,
          cursor: onChange ? "pointer" : "default",
          color: s <= value ? "#c8813a" : "#ddd",
          transition: "color 0.15s"
        }}
      >★</span>
    ))}
  </div>
);

const emptyForm = { name: "", roaster: "", rating: 0, date: new Date().toISOString().slice(0,10), notes: "", photo: null };

export default function App() {
  const [tins, setTins] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [sort, setSort] = useState("date");
  const [search, setSearch] = useState("");
  const [filterRating, setFilterRating] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [preview, setPreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setTins(JSON.parse(saved));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tins));
  }, [tins, loaded]);

  const handlePhoto = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setForm(f => ({ ...f, photo: ev.target.result }));
      setPreview(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.rating) return;
    if (editId !== null) {
      setTins(ts => ts.map(t => t.id === editId ? { ...form, id: editId } : t));
      setEditId(null);
    } else {
      setTins(ts => [...ts, { ...form, id: Date.now() }]);
    }
    setForm(emptyForm);
    setPreview(null);
    setShowForm(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleEdit = tin => {
    setForm({ name: tin.name, roaster: tin.roaster, rating: tin.rating, date: tin.date, notes: tin.notes, photo: tin.photo });
    setPreview(tin.photo);
    setEditId(tin.id);
    setShowForm(true);
  };

  const handleDelete = id => setTins(ts => ts.filter(t => t.id !== id));

  const filtered = tins.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.name.toLowerCase().includes(q) || t.roaster.toLowerCase().includes(q) || t.notes.toLowerCase().includes(q);
    const matchRating = !filterRating || t.rating === filterRating;
    return matchSearch && matchRating;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "rating") return b.rating - a.rating;
    if (sort === "name") return a.name.localeCompare(b.name);
    return new Date(b.date) - new Date(a.date);
  });

  const s = {
    app: { fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif", background: "#faf8f5", minHeight: "100vh", padding: "24px 16px", maxWidth: 640, margin: "0 auto" },
    header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
    title: { fontSize: 26, fontWeight: "bold", color: "#3b2a1a", margin: 0 },
    sub: { fontSize: 13, color: "#9a7f6a", marginTop: 2 },
    btn: (variant="primary") => ({
      padding: variant === "small" ? "5px 12px" : "9px 20px",
      background: variant === "primary" ? "#c8813a" : variant === "danger" ? "#e8d5c8" : "#f0e8e0",
      color: variant === "primary" ? "#fff" : variant === "danger" ? "#a04020" : "#5a3e2b",
      border: "none", borderRadius: 8, cursor: "pointer",
      fontSize: variant === "small" ? 12 : 14, fontFamily: "inherit", fontWeight: 600,
      transition: "opacity 0.15s"
    }),
    card: { background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(60,30,10,0.07)", marginBottom: 14, overflow: "hidden", display: "flex" },
    cardImg: { width: 90, height: 90, objectFit: "cover", flexShrink: 0 },
    cardNoImg: { width: 90, height: 90, background: "#f0e8de", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, flexShrink: 0 },
    cardBody: { padding: "12px 14px", flex: 1, minWidth: 0 },
    cardName: { fontSize: 16, fontWeight: "bold", color: "#3b2a1a", marginBottom: 2 },
    cardMeta: { fontSize: 12, color: "#9a7f6a", marginBottom: 4 },
    cardNotes: { fontSize: 13, color: "#5a3e2b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
    cardActions: { display: "flex", gap: 6, marginTop: 8 },
    formBox: { background: "#fff", borderRadius: 12, boxShadow: "0 1px 6px rgba(60,30,10,0.1)", padding: 20, marginBottom: 24 },
    label: { display: "block", fontSize: 13, color: "#5a3e2b", marginBottom: 4, fontWeight: 600 },
    input: { width: "100%", padding: "8px 10px", border: "1.5px solid #e8d5c8", borderRadius: 8, fontSize: 14, fontFamily: "inherit", color: "#3b2a1a", background: "#faf8f5", boxSizing: "border-box", outline: "none" },
    textarea: { width: "100%", padding: "8px 10px", border: "1.5px solid #e8d5c8", borderRadius: 8, fontSize: 14, fontFamily: "inherit", color: "#3b2a1a", background: "#faf8f5", boxSizing: "border-box", resize: "vertical", minHeight: 70, outline: "none" },
    row: { display: "flex", gap: 12, marginBottom: 14 },
    col: { flex: 1 },
    sortBar: { display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" },
    sortLabel: { fontSize: 13, color: "#9a7f6a" },
    sortBtn: (active) => ({ padding: "5px 12px", background: active ? "#c8813a" : "#f0e8e0", color: active ? "#fff" : "#5a3e2b", border: "none", borderRadius: 20, cursor: "pointer", fontSize: 12, fontFamily: "inherit", fontWeight: 600 }),
    empty: { textAlign: "center", color: "#b8a090", padding: "48px 0", fontSize: 15 },
    photoPreview: { width: "100%", height: 120, objectFit: "cover", borderRadius: 8, marginBottom: 8 },
    formActions: { display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }
  };

  return (
    <div style={s.app}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>☕ Coffee Log</h1>
          <div style={s.sub}>{tins.length} tin{tins.length !== 1 ? "s" : ""} collected</div>
        </div>
        {!showForm && <button style={s.btn()} onClick={() => setShowForm(true)}>+ Add Tin</button>}
      </div>

      {showForm && (
        <div style={s.formBox}>
          <div style={{ ...s.row, marginBottom: 14 }}>
            <div style={s.col}>
              <label style={s.label}>Coffee Name *</label>
              <input style={s.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Ethiopia Yirgacheffe" />
            </div>
            <div style={s.col}>
              <label style={s.label}>Roaster / Origin</label>
              <input style={s.input} value={form.roaster} onChange={e => setForm(f => ({ ...f, roaster: e.target.value }))} placeholder="e.g. Square Mile" />
            </div>
          </div>
          <div style={{ ...s.row, marginBottom: 14 }}>
            <div style={s.col}>
              <label style={s.label}>Rating *</label>
              <StarRating value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
            </div>
            <div style={s.col}>
              <label style={s.label}>Date</label>
              <input type="date" style={s.input} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={s.label}>Tasting Notes</label>
            <textarea style={s.textarea} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="e.g. Blueberry, jasmine, smooth finish..." />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={s.label}>Photo</label>
            {preview && <img src={preview} alt="preview" style={s.photoPreview} />}
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ fontSize: 13, color: "#5a3e2b" }} />
          </div>
          <div style={s.formActions}>
            <button style={s.btn("secondary")} onClick={() => { setForm(emptyForm); setPreview(null); setEditId(null); setShowForm(false); if (fileRef.current) fileRef.current.value = ""; }}>Cancel</button>
            <button style={s.btn()} onClick={handleSubmit}>{editId !== null ? "Save Changes" : "Add to Log"}</button>
          </div>
        </div>
      )}

      {tins.length > 0 && (
        <>
          <input
            style={{ ...s.input, marginBottom: 10, background: "#fff" }}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍  Search by name, roaster or notes..."
          />
          <div style={s.sortBar}>
            <span style={s.sortLabel}>Sort:</span>
            {["date","rating","name"].map(opt => (
              <button key={opt} style={s.sortBtn(sort === opt)} onClick={() => setSort(opt)}>
                {opt === "date" ? "Date" : opt === "rating" ? "Rating" : "Name"}
              </button>
            ))}
            <span style={{ ...s.sortLabel, marginLeft: 8 }}>Filter:</span>
            {[0,1,2,3,4,5].map(r => (
              <button key={r} style={s.sortBtn(filterRating === r)} onClick={() => setFilterRating(r)}>
                {r === 0 ? "All" : "★".repeat(r)}
              </button>
            ))}
          </div>
        </>
      )}

      {loaded && sorted.length === 0 && tins.length > 0 && (
        <div style={s.empty}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
          No tins match your search or filter.
        </div>
      )}

      {loaded && tins.length === 0 && !showForm && (
        <div style={s.empty}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>☕</div>
          No tins yet — add your first coffee!
        </div>
      )}

      {sorted.map(tin => (
        <div key={tin.id} style={s.card}>
          {tin.photo
            ? <img src={tin.photo} alt={tin.name} style={s.cardImg} />
            : <div style={s.cardNoImg}>☕</div>
          }
          <div style={s.cardBody}>
            <div style={s.cardName}>{tin.name}</div>
            <div style={s.cardMeta}>
              {tin.roaster && <span>{tin.roaster} · </span>}
              {tin.date && <span>{new Date(tin.date).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}</span>}
            </div>
            <StarRating value={tin.rating} />
            {tin.notes && <div style={s.cardNotes}>{tin.notes}</div>}
            <div style={s.cardActions}>
              <button style={s.btn("small")} onClick={() => handleEdit(tin)}>Edit</button>
              <button style={s.btn("danger")} onClick={() => handleDelete(tin.id)}>Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}