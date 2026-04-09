import { useState, useEffect, useRef } from 'react'
import './App.css'
import logo from './assets/logo-new.png'
import heroImg from './assets/hero.png'

const DESTACADO_ID = 'p2'

const EXTRAS = [
  { id: 'ex1', nombre: 'Coca 1.5L', emoji: '🥤', tipo: 'bebida', precio: 3000 },
  { id: 'ex2', nombre: 'Fainá', emoji: '🫓', tipo: 'acompañamiento', precio: 2500 },
  { id: 'ex3', nombre: 'Empanadas x3', emoji: '🥟', tipo: 'extra', precio: 4000 },
]

const MENU = {
  promos: [
    { id: 'p1', nombre: 'Doble Muzza', desc: '2 muzzarellas', tag: 'Ideal para compartir', precio: 22000 },
    { id: 'p2', nombre: 'Muzza + J&M', desc: '1 muzza + 1 jamón y morrón', tag: '🔥 La más pedida', urgencia: 'Se pide mucho hoy', precio: 26000 },
    { id: 'p3', nombre: 'Triple Muzza', desc: '3 muzzarellas', tag: 'Para toda la banda', precio: 32000 },
    { id: 'p4', nombre: 'Muzza + Jamón', desc: '1 muzza + 1 jamón', tag: 'Clásica y segura', precio: 24000 },
  ],
  pizzas: [
    { id: 's02', nombre: 'Muzarella', desc: 'La de siempre — no falla', precio: 12000 },
    { id: 's07', nombre: 'Tomate y Muzza', desc: 'Tomate y muzzarella', precio: 15000 },
    { id: 's10', nombre: 'Completa', desc: 'Jamón, huevo y morrón', precio: 17000 },
    { id: 's14', nombre: 'Jamón & Morrón', desc: 'Jamón, morrón y muzzarella', precio: 15000 },
    { id: 's17', nombre: 'Cebolla', desc: 'Cebolla y muzzarella', precio: 12000 },
    { id: 's22', nombre: 'Calabresa', desc: 'Calabresa y muzzarella', urgencia: 'Vuela rápido', precio: 15000 },
    { id: 's23', nombre: 'Cheddar & Salchicha', desc: 'Cheddar y salchicha', precio: 20000 },
    { id: 's26', nombre: 'Cheddar & Jamón', desc: 'Cheddar y jamón', precio: 20000 },
    { id: 's27', nombre: 'Napolitana Plus', desc: 'Tomate, huevo y jamón', precio: 17000 },
    { id: 's33', nombre: 'Calabresa Doble', desc: 'Calabresa y muzzarella', precio: 17000 },
    { id: 's37', nombre: 'Jamón & Muzza', desc: 'Jamón y muzzarella', precio: 14000 },
    { id: 's41', nombre: 'Roquefort', desc: 'Jamón y roquefort', precio: 17000 },
    { id: 's45', nombre: 'Cheddar & Huevo', desc: 'Cheddar y huevo', precio: 20000 },
    { id: 's47', nombre: 'Jamón & Tomate', desc: 'Jamón y tomate', precio: 15000 },
    { id: 's50', nombre: 'Huevo & Muzza', desc: 'Muzzarella y huevo', precio: 14000 },
    { id: 's55', nombre: 'Calabresa & Huevo', desc: 'Calabresa y huevo', precio: 15000 },
    { id: 's60', nombre: 'Calabresa & Tomate', desc: 'Calabresa y tomate', precio: 15000 },
  ],
  extras: EXTRAS,
}

const UPSELL_RULES = {
  p1: { ids: ['ex1', 'ex2'], copy: '¿Le sumamos algo?' },
  p2: { ids: ['ex1', 'ex2'], copy: '¿Le sumamos algo?' },
  p3: { ids: ['ex1', 'ex3'], copy: '¿Sumamos bebida o algo más?' },
  p4: { ids: ['ex1', 'ex2'], copy: '¿Le sumamos algo?' },
  s02: { ids: ['ex1', 'ex2'], copy: 'Podés agregar esto' },
  s17: { ids: ['ex1', 'ex2'], copy: 'Podés agregar esto' },
  s22: { ids: ['ex1', 'ex2'], copy: 'Podés agregar esto' },
  s23: { ids: ['ex1', 'ex3'], copy: '¿Le sumamos algo?' },
  s26: { ids: ['ex1', 'ex3'], copy: '¿Le sumamos algo?' },
  s45: { ids: ['ex1', 'ex3'], copy: '¿Le sumamos algo?' },
  s10: { ids: ['ex1', 'ex3'], copy: '¿Le sumamos algo?' },
  _default: { ids: ['ex1', 'ex2', 'ex3'], copy: '¿Le sumamos algo?' },
}

function getUpsellsForProduct(productId, carrito) {
  const rule = UPSELL_RULES[productId] || UPSELL_RULES._default
  const filtered = rule.ids
    .map(id => EXTRAS.find(e => e.id === id))
    .filter(e => e && !carrito[e.id])
  return { extras: filtered, copy: rule.copy }
}

const NUMERO_WHATSAPP = '5491130282746'
const destacado = MENU.promos.find(p => p.id === DESTACADO_ID)

const formatPrecio = (n) => '$' + n.toLocaleString('es-AR')

/* Top 3 para el menú rápido del hero */
const TOP_PICKS = [
  { ...MENU.promos.find(p => p.id === 'p2'), badge: '🔥 LA MÁS PEDIDA' },
  { ...MENU.promos.find(p => p.id === 'p1'), badge: '🍕 COMBO' },
  { ...MENU.pizzas.find(p => p.id === 's23'), badge: '⭐ PREMIUM' },
]

function App() {
  const [carrito, setCarrito] = useState({})
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [nombre, setNombre] = useState('')
  const [direccion, setDireccion] = useState('')
  const [entreCalles, setEntreCalles] = useState('')
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [carritoMobileOpen, setCarritoMobileOpen] = useState(false)
  const [upsellVisible, setUpsellVisible] = useState(false)
  const [upsellData, setUpsellData] = useState(null)
  const menuRef = useRef(null)

  const scrollToMenu = () => {
    menuRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const obtenerProducto = (id) => {
    for (const items of Object.values(MENU)) {
      const p = items.find(x => x.id === id)
      if (p) return p
    }
    return null
  }

  const agregar = (id, showUpsell = false) => {
    setCarrito(prev => {
      const next = { ...prev, [id]: (prev[id] || 0) + 1 }
      if (showUpsell) {
        const p = obtenerProducto(id)
        const { extras, copy } = getUpsellsForProduct(id, next)
        if (extras.length > 0) {
          setUpsellData({ producto: p, extras, copy })
          setUpsellVisible(true)
        }
      }
      return next
    })
  }

  const agregarExtra = (id) => {
    setCarrito(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }))
  }

  const restar = (id) => {
    setCarrito(prev => {
      const n = { ...prev }
      if (n[id] > 1) n[id]--
      else delete n[id]
      return n
    })
  }

  const cerrarUpsell = () => {
    setUpsellVisible(false)
    setUpsellData(null)
  }

  useEffect(() => {
    if (upsellVisible) {
      const timer = setTimeout(cerrarUpsell, 8000)
      return () => clearTimeout(timer)
    }
  }, [upsellVisible])

  const totalItems = Object.values(carrito).reduce((a, b) => a + b, 0)
  const totalPrecio = Object.entries(carrito).reduce((sum, [id, cant]) => {
    const p = obtenerProducto(id)
    return sum + (p ? p.precio * cant : 0)
  }, 0)

  const enviarWhatsApp = () => {
    if (!nombre.trim()) return alert('Ingresá tu nombre')
    if (!direccion.trim()) return alert('Ingresá tu dirección con altura')
    if (!entreCalles.trim()) return alert('Ingresá las entre calles')

    const lista = Object.entries(carrito)
      .map(([id, cant]) => {
        const p = obtenerProducto(id)
        return `• ${p.nombre}${p.desc ? ` (${p.desc})` : ''} x${cant} — ${formatPrecio(p.precio * cant)}`
      })
      .join('\n')

    const pago = metodoPago === 'efectivo' ? 'Efectivo' : 'Transferencia/MP'

    const msg = `🍕 *NUEVO PEDIDO — PIZZARAP* 🍕

*Cliente:* ${nombre}
*Dirección:* ${direccion}
*Entre calles:* ${entreCalles}
*Pago:* ${pago}

*Pedido:*
${lista}

*TOTAL: ${formatPrecio(totalPrecio)}*`

    window.open(`https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank')
    setMostrarFormulario(false)
    setNombre('')
    setDireccion('')
    setEntreCalles('')
    setMetodoPago('efectivo')
    setCarrito({})
    setCarritoMobileOpen(false)
  }

  const renderCategoria = (key, titulo) => (
    <div key={key} className="categoria">
      <h3 className="categoria-titulo">
        <span className="categoria-titulo-text">{titulo}</span>
        <span className="categoria-titulo-line"></span>
      </h3>
      <div className={`productos-grid ${key === 'promos' ? 'promos-grid' : ''}`}>
        {MENU[key].map(p => {
          const isDestacado = p.id === DESTACADO_ID
          const isPromoOrPizza = key === 'promos' || key === 'pizzas'
          return (
            <div key={p.id} className={`producto-card ${key === 'promos' ? 'promo-card' : ''} ${isDestacado ? 'card-destacada' : ''}`}>
              {isDestacado && <span className="badge-destacado">🔥 LA MÁS PEDIDA</span>}
              {p.tag && !isDestacado && <span className="producto-tag">{p.tag}</span>}
              <div className="producto-info">
                <p className="precio">{formatPrecio(p.precio)}</p>
                <h4>{p.nombre}</h4>
                <p className="producto-desc">{p.desc}</p>
                {p.urgencia && <span className="urgencia">🔥 {p.urgencia}</span>}
              </div>
              <div className="producto-controles">
                {carrito[p.id] ? (
                  <div className="contador">
                    <button className="btn-small" onClick={() => restar(p.id)}>−</button>
                    <span>{carrito[p.id]}</span>
                    <button className="btn-small" onClick={() => agregar(p.id)}>+</button>
                  </div>
                ) : (
                  <button className={`btn-agregar ${isDestacado ? 'btn-agregar-destacado' : ''}`} onClick={() => agregar(p.id, isPromoOrPizza)}>
                    {isDestacado ? '¡Lo quiero!' : 'Lo quiero'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const carritoScrollable = (
    <div className="carrito-contenido">
      {totalItems === 0 ? (
        <div className="carrito-vacio">
          <p className="carrito-vacio-titulo">🔥 Arrancá con la más pedida</p>
          <div className="carrito-sugerencia" onClick={() => agregar(destacado.id)}>
            <span className="carrito-sugerencia-precio">{formatPrecio(destacado.precio)}</span>
            <span className="carrito-sugerencia-nombre">{destacado.nombre}</span>
            <span className="carrito-sugerencia-desc">{destacado.desc}</span>
            <button className="carrito-sugerencia-btn">¡Lo quiero!</button>
          </div>
        </div>
      ) : (
        <>
          <div className="carrito-items">
            {Object.entries(carrito).map(([id, cant]) => {
              const p = obtenerProducto(id)
              if (!p) return null
              return (
                <div key={id} className="carrito-item">
                  <div className="carrito-item-info">
                    <span className="carrito-item-nombre">{p.emoji ? `${p.emoji} ` : ''}{p.nombre}</span>
                    <span className="cantidad-precio">{cant}x {formatPrecio(p.precio * cant)}</span>
                  </div>
                  <div className="carrito-item-controles">
                    <button className="carrito-btn-small" onClick={() => restar(id)}>−</button>
                    <span className="carrito-cantidad">{cant}</span>
                    <button className="carrito-btn-small" onClick={() => agregar(id)}>+</button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )

  const carritoFooter = totalItems > 0 && (
    <div className="carrito-footer">
      <div className="carrito-footer-inner">
        <div className="carrito-footer-total">
          <span className="carrito-footer-label">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
          <strong className="carrito-footer-precio">{formatPrecio(totalPrecio)}</strong>
        </div>
        <button className="btn-cta" onClick={() => setMostrarFormulario(true)}>
          <span className="btn-cta-text">Pedir ahora</span>
          <span className="btn-cta-sub">por WhatsApp</span>
        </button>
      </div>
      <button className="btn-limpiar" onClick={() => setCarrito({})}>Vaciar pedido</button>
    </div>
  )

  return (
    <div className="app-container">
      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg">
          <img src={heroImg} alt="" className="hero-img" />
          <div className="hero-overlay" />
        </div>
        <div className="hero-content">
          <div className="hero-brand">
            <img src={logo} alt="PizzaRap" className="hero-logo" />
            <div>
              <h1 className="hero-title">PIZZARAP</h1>
              <p className="hero-tagline">Pizzas que no fallan.</p>
            </div>
          </div>
          <div className="hero-info-bar">
            <span>📍 Hurlingham</span>
            <span>🕐 Abierto ahora</span>
            <span>📱 Pedí por WhatsApp</span>
          </div>
          <button className="hero-cta" onClick={scrollToMenu}>
            PEDIR AHORA
          </button>

          {/* Quick picks */}
          <div className="hero-picks">
            {TOP_PICKS.map(p => (
              <div key={p.id} className={`hero-pick ${p.id === DESTACADO_ID ? 'hero-pick-featured' : ''}`}>
                <span className="hero-pick-badge">{p.badge}</span>
                <span className="hero-pick-name">{p.nombre}</span>
                <span className="hero-pick-desc">{p.desc}</span>
                <span className="hero-pick-price">{formatPrecio(p.precio)}</span>
                <button className="hero-pick-btn" onClick={() => agregar(p.id, true)}>
                  Agregar
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAIN LAYOUT ── */}
      <div className="main-layout" ref={menuRef}>
        <section className="productos-section">
          {renderCategoria('promos', 'PROMOS')}
          {renderCategoria('pizzas', 'PIZZAS')}
          <div className="categoria">
            <h3 className="categoria-titulo">
              <span className="categoria-titulo-text">EXTRAS</span>
              <span className="categoria-titulo-line"></span>
            </h3>
            <div className="extras-grid">
              {EXTRAS.map(e => (
                <div key={e.id} className="extra-card">
                  <span className="extra-emoji">{e.emoji}</span>
                  <div className="extra-info">
                    <span className="extra-nombre">{e.nombre}</span>
                    <span className="extra-precio">+{formatPrecio(e.precio)}</span>
                  </div>
                  <div className="producto-controles">
                    {carrito[e.id] ? (
                      <div className="contador">
                        <button className="btn-small" onClick={() => restar(e.id)}>−</button>
                        <span>{carrito[e.id]}</span>
                        <button className="btn-small" onClick={() => agregar(e.id)}>+</button>
                      </div>
                    ) : (
                      <button className="btn-agregar btn-agregar-extra" onClick={() => agregarExtra(e.id)}>Lo quiero</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="carrito-section carrito-desktop">
          <h2>Tu Pedido</h2>
          {carritoScrollable}
          {carritoFooter}
        </aside>
      </div>

      {/* UPSELL TOAST */}
      {upsellVisible && upsellData && (
        <div className="upsell-toast">
          <div className="upsell-toast-header">
            <span className="upsell-toast-check">✓</span>
            <span className="upsell-toast-added">{upsellData.producto.nombre} agregado</span>
            <button className="upsell-toast-close" onClick={cerrarUpsell}>✕</button>
          </div>
          <p className="upsell-toast-title">{upsellData.copy}</p>
          <div className="upsell-toast-options">
            {upsellData.extras.map((e) => (
              <button key={e.id} className="upsell-toast-btn" onClick={() => { agregarExtra(e.id); cerrarUpsell() }}>
                <span className="upsell-toast-emoji">{e.emoji}</span>
                <span className="upsell-toast-name">{e.nombre}</span>
                <span className="upsell-toast-price">+{formatPrecio(e.precio)}</span>
              </button>
            ))}
          </div>
          <button className="upsell-toast-skip" onClick={cerrarUpsell}>Continuar sin agregar</button>
        </div>
      )}

      {/* MOBILE STICKY BAR — SIEMPRE VISIBLE */}
      {!carritoMobileOpen && !upsellVisible && (
        <div className="mobile-sticky-bar">
          {totalItems > 0 && (
            <div className="mobile-sticky-info" onClick={() => setCarritoMobileOpen(true)}>
              <span className="mobile-sticky-count">{totalItems}</span>
              <span className="mobile-sticky-total">{formatPrecio(totalPrecio)}</span>
            </div>
          )}
          <button
            className="mobile-sticky-cta"
            onClick={() => totalItems > 0 ? setMostrarFormulario(true) : scrollToMenu()}
          >
            {totalItems > 0 ? `PEDIR AHORA — ${formatPrecio(totalPrecio)}` : 'VER MENÚ'}
          </button>
        </div>
      )}

      {carritoMobileOpen && (
        <div className="carrito-mobile-overlay" onClick={() => setCarritoMobileOpen(false)}>
          <div className="carrito-mobile" onClick={e => e.stopPropagation()}>
            <div className="carrito-mobile-header">
              <h2>Tu Pedido</h2>
              <button className="modal-close" onClick={() => setCarritoMobileOpen(false)}>✕</button>
            </div>
            {carritoScrollable}
            {carritoFooter}
          </div>
        </div>
      )}

      {mostrarFormulario && (
        <div className="modal-overlay" onClick={() => setMostrarFormulario(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Datos de Entrega</h3>
              <button className="modal-close" onClick={() => setMostrarFormulario(false)}>✕</button>
            </div>
            <div className="modal-content">
              <div className="formulario-grupo">
                <label htmlFor="nombre">Nombre</label>
                <input id="nombre" type="text" placeholder="Tu nombre"
                  value={nombre} onChange={e => setNombre(e.target.value)} className="formulario-input" />
              </div>
              <div className="formulario-grupo">
                <label htmlFor="direccion">Dirección (con altura)</label>
                <input id="direccion" type="text" placeholder="Ej: Av. Vergara 1234"
                  value={direccion} onChange={e => setDireccion(e.target.value)} className="formulario-input" />
              </div>
              <div className="formulario-grupo">
                <label htmlFor="entreCalles">Entre calles / Referencia</label>
                <input id="entreCalles" type="text" placeholder="Ej: entre Jujuy y Salta"
                  value={entreCalles} onChange={e => setEntreCalles(e.target.value)} className="formulario-input" />
              </div>
              <div className="formulario-grupo">
                <label>Pago</label>
                <div className="metodo-pago">
                  <label className="radio-option">
                    <input type="radio" name="pago" value="efectivo"
                      checked={metodoPago === 'efectivo'} onChange={e => setMetodoPago(e.target.value)} />
                    <span>Efectivo</span>
                  </label>
                  <label className="radio-option">
                    <input type="radio" name="pago" value="transferencia"
                      checked={metodoPago === 'transferencia'} onChange={e => setMetodoPago(e.target.value)} />
                    <span>Transferencia / MP</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-cancel" onClick={() => setMostrarFormulario(false)}>Cancelar</button>
              <button className="modal-confirm" onClick={enviarWhatsApp}>Pedir ahora</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
