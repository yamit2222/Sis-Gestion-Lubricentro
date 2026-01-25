import React, { useEffect, useState } from "react";
import { 
  Container, 
  Typography, 
  Box, 
  Paper
} from "@mui/material";
import { getAllProductos } from "../services/producto.service";

const CATEGORIAS = [
  { key: "aceite", label: "Aceites" },
  { key: "filtro", label: "Filtros" },
  { key: "bateria", label: "Baterías" },
];

const Inventario = () => {
  const [productos, setProductos] = useState([]);
  const [open, setOpen] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await getAllProductos();
        // Manejar la nueva estructura de respuesta con paginación
        if (response.data && response.data.productos) {
          setProductos(response.data.productos);
        } else if (Array.isArray(response.data)) {
          setProductos(response.data);
        } else if (Array.isArray(response)) {
          setProductos(response);
        } else {
          setProductos([]);
        }
      } catch (error) {
        setProductos([]);
      }
    };
    fetchProductos();
  }, []);

  const productosFiltrados = productos.filter((p) => {
    if (!search.trim()) return true;
    const texto = `${p.nombre} ${p.descripcion} ${p.marca} ${p.subcategoria}`.toLowerCase();
    return texto.includes(search.toLowerCase());
  });

  const getSubcategorias = (categoria) => {
    const subs = productosFiltrados
      .filter((p) => p.categoria === categoria)
      .map((p) => p.subcategoria)
      .filter((v, i, arr) => v && arr.indexOf(v) === i);
    return subs.length > 0 ? subs : ["Sin subcategoría"];
  };

  const grouped = {};
  CATEGORIAS.forEach(({ key }) => {
    grouped[key] = {};
    getSubcategorias(key).forEach((sub) => {
      grouped[key][sub] = productosFiltrados.filter(
        (p) => p.categoria === key && p.subcategoria === sub
      );
    });
  });

  const toggleSub = (cat, sub) => {
    setOpen((prev) => ({
      ...prev,
      [cat]: {
        ...prev[cat],
        [sub]: !prev[cat]?.[sub],
      },
    }));
  };
  return (
      <div style={{ minHeight: '100vh', backgroundImage: 'linear-gradient(90deg, #23272f,#353945,#4e4e4e)', padding: 0, overflow: 'hidden' }}>
      <Container maxWidth="lg" sx={{ mt: '12vh', mb: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            mb: 4, 
            borderRadius: 3,
            bgcolor: '#23272F',
            boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
            border: '2px solid #FFB800',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h4" component="h1" sx={{ color: '#FFB800', fontWeight: 800, letterSpacing: 1 }}>
                Inventario de Productos
              </Typography>
            </Box>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar producto, marca, descripción o subcategoría..."
              style={{
                width: "100%",
                maxWidth: 400,
                padding: "10px 16px",
                fontSize: 16,
                borderRadius: 8,
                border: "1px solid #444",
                background: "#2C303A",
                color: "#F3F4F6",
                boxShadow: "0 1px 4px #0002",
                outline: "none",
                margin: "0 auto",
                display: "block"
              }}
            />
          </Box>
          
          {/* Categories */}
          <div className="inventario-multi" style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            {CATEGORIAS.map(({ key, label }) => (
              <div key={key} className="inventario-card" style={{ minWidth: 320, boxShadow: "0 2px 12px #0004", borderRadius: 16, padding: 20, background: "#2C303A", flex: "1 1 340px", marginBottom: 24, border: "1px solid #444" }}>
                <div style={{ fontWeight: "bold", fontSize: 20, marginBottom: 12, letterSpacing: 1, color: '#FFB800' }}>{label}</div>
                {getSubcategorias(key).map((sub) => (
                  <div key={sub} style={{ marginBottom: 10, borderBottom: "1px solid #444" }}>
                    <button
                      className="subcat-toggle"
                      aria-expanded={!!open[key]?.[sub]}
                      onClick={() => toggleSub(key, sub)}
                      style={{
                        background: "none",
                        border: "none",
                        width: "100%",
                        textAlign: "left",
                        fontWeight: "500",
                        fontSize: 16,
                        padding: "8px 0",
                        cursor: "pointer",
                        color: "#F3F4F6",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        transition: "color 0.2s"
                      }}
                    >
                      <span style={{ flex: 1 }}>{sub.charAt(0).toUpperCase() + sub.slice(1)}</span>
                      <span style={{ transition: "transform 0.2s", transform: open[key]?.[sub] ? "rotate(180deg)" : "rotate(0deg)" }}>
                        ▼
                      </span>
                    </button>
                    {open[key]?.[sub] && (
                      <ul style={{ listStyle: "none", margin: 0, padding: "0 0 8px 0" }}>
                        {grouped[key][sub].length === 0 ? (
                          <li style={{ color: "#888", fontStyle: "italic", padding: "4px 0 4px 12px" }}>Sin productos</li>
                        ) : (
                          grouped[key][sub].map((prod) => (
                            <li key={prod.id} style={{ padding: "6px 0 6px 12px", borderRadius: 6, marginBottom: 2, background: "#23272F", boxShadow: "0 1px 4px #0002", display: "flex", justifyContent: "space-between", alignItems: "center", color: '#F3F4F6' }}>
                              <span style={{ fontWeight: 500 }}>{prod.nombre}</span>
                              <span style={{ fontSize: "0.95em", color: "#B0B3B8", marginRight: "12px" }}>Stock: {prod.stock}</span>
                            </li>
                          ))
                        )}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Paper>
      </Container>
    </div>
  );
};

export default Inventario;
