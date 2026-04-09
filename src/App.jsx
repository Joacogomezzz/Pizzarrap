import { useState } from 'react'
import './App.css'
import logoImg from './assets/logo-new.png'

/* ── Datos del menú ── */
const MENU = [
  {
    categoria: 'PIZZAS',
    productos: [
      { id: 1, nombre: 'Muzzarella', desc: 'Salsa, muzzarella', precio: 7500 },
      { id: 2, nombre: 'Napolitana', desc: 'Salsa, muzzarella, tomate, ajo', precio: 8500 },
      { id: 3, nombre: 'Fugazzeta', desc: 'Muzzarella, cebolla', precio: 8500 },
      { id: 4, nombre: 'Jamón y Morrones', desc: 'Salsa, muzzarella, jamón, morrones', precio: 9000 },
      { id: 5, nombre: 'Cuatro Quesos', desc: 'Muzzarella, roquefort, parmesano, provolone', precio: 9500 },
      { id: 6, nombre: 'Especial', desc: 'Salsa, muzzarella, jamón, huevo, aceitunas', precio: 9500 },
    ],
  },
  {
    categoria: 'EMPANADAS',
    productos: [
      { id: 20, nombre: 'Carne (x1)', desc: 'Empanada de carne cortada a cuchillo', precio: 1500 },
      { id: 21, nombre: 'Jamón y Queso (x1)', desc: 'Empanada de jamón y queso', precio: 1500 },
      { id: 22, nombre: 'Pollo (x1)', desc: 'Empanada de pollo', precio: 1500 },
      { id: 23, nombre: 'Humita (x1)', desc: 'Empanada de humita', precio: 1500 },
      { id: 24, nombre: 'Docena Surtida', desc: '12 empanadas a elección', precio: 15000, destacada: true },
    ],
  },
  {
    categoria: 'BEBIDAS',
    productos: [
      { id: 40, nombre: 'Coca-Cola 1.5L', desc: 'Coca-Cola línea', precio: 3000 },
      { id: 41, nombre: 'Agua 500ml', desc: 'Agua mineral', precio: 1500 },
      { id: 42, nombre: 'Cerveza 1L', desc: 'Cerveza artesanal', precio: 4000 },
    ],
  },
]

const PROMOS = [
  {
    id: 100,
    nombre: 'Promo Pizza + Bebida',
    desc: 'Muzzarella + Coca 1.5L',
    precio: 9500,
    destacada: true,
    urgencia: '¡Más pedida!',
  },
  {
    id: 101,
    nombre: 'Promo Docena + Pizza',
    desc: '12 empanadas + Muzzarella',
    precio: 20000,
    destacada: true,
  },
]

const EXTRAS = [
  { id: 200, nombre: 'Fainá', emoji: '🫓', precio: 3000 },
  { id: 201, nombre: 'Salsa extra', emoji: '🫙', precio: 500 },
  { id: 202, nombre: 'Postre', emoji: '🍮', precio: 3500 },
]

const TELEFONO_WPP = '5491112345678'

/* ── Helpers ── */
function formatPrecio(n) {
  return '$' + n.toLocaleString('es-AR')
}

function buildMensajeWpp(carrito, nombre, direccion, pago) {
  let msg = `🍕 *Nuevo Pedido — Pizzarrap*\n\n`
  msg += `👤 *${nombre}*\n📍 ${direccion}\n💰 ${pago}\n\n`
  msg += `*Detalle:*\n`
  carrito.forEach((item) => {
    msg += `• ${item.nombre} x${item.cantidad} — ${formatPrecio(item.precio * item.cantidad)}\n`
  })
  const total = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0)
  msg += `\n*Total: ${formatPrecio(total)}*`
  return encodeURIComponent(msg)
}

/* ── Componentes ── */

function ProductoCard({ producto, onAgregar, cantidadEnCarrito, onSumar, onRestar }) {
  const enCarrito = cantidadEnCarrito > 0
  const esDestacada = producto.destacada

  return (
    <div className={`producto-card${esDestacada ? ' card-destacada' : ''}`}>
      {esDestacada && <span className="badge-destacado">⭐ Recomendado</span>}
      {producto.urgencia && <span className="urgencia">{producto.urgencia}</span>}
      <div className="producto-info">
        <h4>{producto.nombre}</h4>
        {producto.desc && <p className="producto-desc">{producto.desc}</p>}
      </div>
      <span className={`precio`}>{formatPrecio(producto.precio)}</span>
      <div className="producto-controles">
        {!enCarrito ? (
          <button
            className={`btn-agregar${esDestacada ? ' btn-agregar-destacado' : ''}`}
            onClick={() => onAgregar(producto)}
          >
            Agregar
          </button>
        ) : (
          <div className="contador">
            <button className="btn-small" onClick={() => onRestar(producto.id)}>−</button>
            <span>{cantidadEnCarrito}</span>
            <button className="btn-small" onClick={() => onSumar(producto.id)}>+</button>
          </div>
        )}
      </div>
    </div>
  )
}

function CarritoItem({ item, onSumar, onRestar }) {
  return (
    <div className="carrito-item">
      <div className="carrito-item-info">
        <span className="carrito-item-nombre">{item.nombre}</span>
      </div>
      <div className="carrito-item-controles">
        <button className="carrito-btn-small" onClick={() => onRestar(item.id)}>−</button>
        <span className="carrito-cantidad">{item.cantidad}</span>
        <button className="carrito-btn-small" onClick={() => onSumar(item.id)}>+</button>
      </div>
      <span className="cantidad-precio">{formatPrecio(item.precio * item.cantidad)}</span>
    </div>
  )
}

function UpsellToast({ items, onAgregar, onCerrar }) {
  if (!items || items.length === 0) return null
  return (
    <div className="upsell-toast">
      <div className="upsell-toast-header">
        <div className="upsell-toast-check">✓</div>
        <span className="upsell-toast-added">¡Agregado al carrito!</span>
        <button className="upsell-toast-close" onClick={onCerrar}>✕</button>
      </div>
      <div className="upsell-toast-title">¿Sumamos algo más?</div>
      <div className="upsell-toast-options">
        {items.map((item) => (
          <button key={item.id} className="upsell-toast-btn" onClick={() => onAgregar(item)}>
            <span className="upsell-toast-emoji">{item.emoji}</span>
            <span className="upsell-toast-name">{item.nombre}</span>
            <span className="upsell-toast-price">{formatPrecio(item.precio)}</span>
          </button>
        ))}
      </div>
      <button className="upsell-toast-skip" onClick={onCerrar}>No, gracias</button>
    </div>
  )
}

function ModalCheckout({ carrito, total, onCerrar, onEnviar }) {
  const [nombre, setNombre] = useState('')
  const [direccion, setDireccion] = useState('')
  const [pago, setPago] = useState('Efectivo')

  const handleEnviar = () => {
    if (!nombre.trim() || !direccion.trim()) return
    onEnviar(nombre, direccion, pago)
  }

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Confirmar Pedido</h3>
          <button className="modal-close" onClick={onCerrar}>✕</button>
        </div>
        <div className="modal-content">
          <div className="formulario-grupo">
            <label>Nombre</label>
            <input
              className="formulario-input"
              placeholder="Tu nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div className="formulario-grupo">
            <label>Dirección</label>
            <input
              className="formulario-input"
              placeholder="Calle y número"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
            />
          </div>
          <div className="formulario-grupo">
            <label>Método de pago</label>
            <div className="metodo-pago">
              <label className="radio-option">
                <input type="radio" name="pago" value="Efectivo" checked={pago === 'Efectivo'} onChange={() => setPago('Efectivo')} />
                <span>Efectivo</span>
              </label>
              <label className="radio-option">
                <input type="radio" name="pago" value="Transferencia" checked={pago === 'Transferencia'} onChange={() => setPago('Transferencia')} />
                <span>Transferencia</span>
              </label>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="modal-cancel" onClick={onCerrar}>Cancelar</button>
          <button className="modal-confirm" onClick={handleEnviar}>
            Enviar por WhatsApp — {formatPrecio(total)}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── App principal ── */
function App() {
  const [carrito, setCarrito] = useState([])
  const [showCheckout, setShowCheckout] = useState(false)
  const [showMobileCart, setShowMobileCart] = useState(false)
  const [upsellVisible, setUpsellVisible] = useState(false)

  const total = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0)
  const totalItems = carrito.reduce((s, i) => s + i.cantidad, 0)

  function getCantidad(id) {
    const item = carrito.find((i) => i.id === id)
    return item ? item.cantidad : 0
  }

  function agregar(producto) {
    setCarrito((prev) => {
      const existe = prev.find((i) => i.id === producto.id)
      if (existe) return prev.map((i) => (i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i))
      return [...prev, { ...producto, cantidad: 1 }]
    })
    setUpsellVisible(true)
    setTimeout(() => setUpsellVisible(false), 5000)
  }

  function sumar(id) {
    setCarrito((prev) => prev.map((i) => (i.id === id ? { ...i, cantidad: i.cantidad + 1 } : i)))
  }

  function restar(id) {
    setCarrito((prev) => prev.map((i) => (i.id === id ? { ...i, cantidad: i.cantidad - 1 } : i)).filter((i) => i.cantidad > 0))
  }

  function limpiar() {
    setCarrito([])
  }

  function enviarWhatsApp(nombre, direccion, pago) {
    const msg = buildMensajeWpp(carrito, nombre, direccion, pago)
    window.open(`https://wa.me/${TELEFONO_WPP}?text=${msg}`, '_blank')
    setShowCheckout(false)
    setCarrito([])
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-brand">
          <div className="header-logo-wrapper">
            <img src={logoImg} alt="Pizzarrap" className="header-logo" />
          </div>
          <div className="header-text">
            <h1>Pizzarrap</h1>
            <span className="header-tagline">Pizzas & Empanadas</span>
            <span className="header-sub">Pedí online · Delivery</span>
          </div>
        </div>
      </header>

      <div className="main-layout">
        {/* Productos */}
        <section className="productos-section">
          {/* Promos */}
          <div className="categoria">
            <div className="categoria-titulo">
              <span className="categoria-titulo-text">PROMOS</span>
              <div className="categoria-titulo-line" />
            </div>
            <div className="productos-grid promos-grid">
              {PROMOS.map((p) => (
                <ProductoCard
                  key={p.id}
                  producto={p}
                  onAgregar={agregar}
                  cantidadEnCarrito={getCantidad(p.id)}
                  onSumar={sumar}
                  onRestar={restar}
                />
              ))}
            </div>
          </div>

          {/* Categorías */}
          {MENU.map((cat) => (
            <div key={cat.categoria} className="categoria">
              <div className="categoria-titulo">
                <span className="categoria-titulo-text">{cat.categoria}</span>
                <div className="categoria-titulo-line" />
              </div>
              <div className="productos-grid">
                {cat.productos.map((p) => (
                  <ProductoCard
                    key={p.id}
                    producto={p}
                    onAgregar={agregar}
                    cantidadEnCarrito={getCantidad(p.id)}
                    onSumar={sumar}
                    onRestar={restar}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Extras */}
          <div className="categoria">
            <div className="categoria-titulo">
              <span className="categoria-titulo-text">EXTRAS</span>
              <div className="categoria-titulo-line" />
            </div>
            <div className="extras-grid">
              {EXTRAS.map((e) => (
                <div key={e.id} className="extra-card">
                  <span className="extra-emoji">{e.emoji}</span>
                  <div className="extra-info">
                    <span className="extra-nombre">{e.nombre}</span>
                    <span className="extra-precio">{formatPrecio(e.precio)}</span>
                  </div>
                  <button className="btn-agregar btn-agregar-extra" onClick={() => agregar(e)}>
                    Agregar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Carrito Desktop */}
        <aside className="carrito-desktop">
          <h2>🛒 TU PEDIDO</h2>
          <div className="carrito-contenido">
            {carrito.length === 0 ? (
              <div className="carrito-vacio">
                <span className="carrito-vacio-titulo">Tu carrito está vacío</span>
                <div
                  className="carrito-sugerencia"
                  onClick={() => agregar(PROMOS[0])}
                >
                  <span className="carrito-sugerencia-nombre">{PROMOS[0].nombre}</span>
                  <span className="carrito-sugerencia-desc">{PROMOS[0].desc}</span>
                  <span className="carrito-sugerencia-precio">{formatPrecio(PROMOS[0].precio)}</span>
                  <button className="carrito-sugerencia-btn">Agregar</button>
                </div>
              </div>
            ) : (
              <>
                <div className="carrito-items">
                  {carrito.map((item) => (
                    <CarritoItem key={item.id} item={item} onSumar={sumar} onRestar={restar} />
                  ))}
                </div>
                <div className="carrito-acciones">
                  <button className="btn-limpiar" onClick={limpiar}>Vaciar carrito</button>
                </div>
              </>
            )}
          </div>
          {carrito.length > 0 && (
            <div className="carrito-footer">
              <div className="carrito-footer-inner">
                <div className="carrito-footer-total">
                  <span className="carrito-footer-label">Total</span>
                  <span className="carrito-footer-precio">{formatPrecio(total)}</span>
                </div>
                <button className="btn-cta" onClick={() => setShowCheckout(true)}>
                  <span className="btn-cta-text">Pedir</span>
                  <span className="btn-cta-sub">Enviar por WhatsApp</span>
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Mobile sticky bar */}
      {carrito.length > 0 && (
        <div className="mobile-sticky-bar" style={{ display: undefined }}>
          <div className="mobile-sticky-info" onClick={() => setShowMobileCart(true)}>
            <span className="mobile-sticky-count">{totalItems}</span>
            <span className="mobile-sticky-total">{formatPrecio(total)}</span>
          </div>
          <button className="mobile-sticky-cta" onClick={() => setShowCheckout(true)}>
            Pedir
          </button>
        </div>
      )}

      {/* Mobile cart drawer */}
      {showMobileCart && (
        <div className="carrito-mobile-overlay" onClick={() => setShowMobileCart(false)}>
          <div className="carrito-mobile" onClick={(e) => e.stopPropagation()}>
            <div className="carrito-mobile-header">
              <h2>🛒 TU PEDIDO</h2>
              <button className="modal-close" onClick={() => setShowMobileCart(false)}>✕</button>
            </div>
            <div className="carrito-items">
              {carrito.map((item) => (
                <CarritoItem key={item.id} item={item} onSumar={sumar} onRestar={restar} />
              ))}
            </div>
            <div className="carrito-footer">
              <div className="carrito-footer-inner">
                <div className="carrito-footer-total">
                  <span className="carrito-footer-label">Total</span>
                  <span className="carrito-footer-precio">{formatPrecio(total)}</span>
                </div>
                <button className="btn-cta" onClick={() => { setShowMobileCart(false); setShowCheckout(true) }}>
                  <span className="btn-cta-text">Pedir</span>
                  <span className="btn-cta-sub">Enviar por WhatsApp</span>
                </button>
              </div>
              <button className="btn-limpiar" onClick={limpiar}>Vaciar carrito</button>
            </div>
          </div>
        </div>
      )}

      {/* Upsell toast */}
      {upsellVisible && <UpsellToast items={EXTRAS} onAgregar={agregar} onCerrar={() => setUpsellVisible(false)} />}

      {/* Modal checkout */}
      {showCheckout && (
        <ModalCheckout
          carrito={carrito}
          total={total}
          onCerrar={() => setShowCheckout(false)}
          onEnviar={enviarWhatsApp}
        />
      )}
    </div>
  )
}

export default App
