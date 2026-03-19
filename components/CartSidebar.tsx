'use client'

import { useCart } from '@/contexts/CartContext'

export default function CartSidebar() {
  const { cart, cartOpen, toggleCart, removeItem, total } = useCart()

  return (
    <>
      <div className={`cart-overlay${cartOpen ? ' show' : ''}`} onClick={toggleCart} />
      <div className={`cart-sidebar${cartOpen ? ' open' : ''}`}>
        <div className="cart-hdr">
          <h3 className="cart-hdr-title">Carrinho</h3>
          <button className="cart-close" onClick={toggleCart}>✕</button>
        </div>
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">Seu carrinho está vazio.</div>
          ) : (
            cart.map(item => (
              <div className="cart-item" key={item.name}>
                <div className="cart-item-thumb">👕</div>
                <div className="cart-item-info">
                  <p className="cart-item-name">{item.name}</p>
                  <p className="cart-item-sub">QTD: {item.qty}</p>
                </div>
                <span className="cart-item-price">
                  R$&nbsp;{(item.price * item.qty).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <button className="cart-rm" onClick={() => removeItem(item.name)}>✕</button>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart-ftr">
            <div className="cart-total">
              <span>Total</span>
              <span className="cart-total-val">
                R$&nbsp;{total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <button className="btn-primary" style={{ width: '100%', padding: '16px', textAlign: 'center' }}>
              Finalizar Pedido
            </button>
          </div>
        )}
      </div>
    </>
  )
}
