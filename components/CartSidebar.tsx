'use client'

import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'

export default function CartSidebar() {
  const { cart, cartOpen, toggleCart, removeItem, total, desconto, totalFinal, cupom, applyCoupon, removeCoupon } = useCart()
  const [loading, setLoading] = useState(false)
  const [codigoInput, setCodigoInput] = useState('')
  const [cupomLoading, setCupomLoading] = useState(false)
  const [cupomErro, setCupomErro] = useState('')

  async function handleAplicarCupom() {
    if (!codigoInput.trim()) return
    setCupomLoading(true)
    setCupomErro('')
    const result = await applyCoupon(codigoInput)
    if (result.ok) {
      setCodigoInput('')
    } else {
      const msgs: Record<string, string> = {
        nao_encontrado: 'Cupom não encontrado.',
        inativo:        'Este cupom está inativo.',
        expirado:       'Este cupom expirou.',
        esgotado:       'Este cupom atingiu o limite de usos.',
      }
      setCupomErro(msgs[result.error ?? ''] ?? 'Cupom inválido.')
    }
    setCupomLoading(false)
  }

  async function finalizarPedido() {
    if (cart.length === 0) return
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itens: cart, cupomId: cupom?.cupomId ?? null }),
      })
      const data = await res.json()
      if (data.checkout_url) {
        window.location.href = data.checkout_url
      } else {
        alert(`Erro ao iniciar checkout: ${data.detail || data.error || 'Tente novamente.'}`)
        setLoading(false)
      }
    } catch {
      alert('Erro ao iniciar checkout. Tente novamente.')
      setLoading(false)
    }
  }

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
              <div className="cart-item" key={`${item.produto_id}-${item.tamanho}`}>
                <div className="cart-item-thumb">👕</div>
                <div className="cart-item-info">
                  <p className="cart-item-name">{item.name}</p>
                  <p className="cart-item-sub">TAM: {item.tamanho} · QTD: {item.qty}</p>
                </div>
                <span className="cart-item-price">
                  R$&nbsp;{(item.price * item.qty).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <button className="cart-rm" onClick={() => removeItem(item.produto_id, item.tamanho)}>✕</button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-ftr">
            {/* Cupom */}
            <div className="cart-cupom">
              {cupom ? (
                <div className="cart-cupom-aplicado">
                  <span>
                    <strong>{cupom.codigo}</strong>
                    {cupom.tipo === 'percentual'
                      ? ` — ${cupom.valor}% off`
                      : ` — R$ ${cupom.valor.toFixed(2).replace('.', ',')} off`}
                  </span>
                  <button onClick={() => { removeCoupon(); setCupomErro('') }}>✕</button>
                </div>
              ) : (
                <>
                  <div className="cart-cupom-row">
                    <input
                      type="text"
                      className="cart-cupom-input"
                      placeholder="Código do cupom"
                      value={codigoInput}
                      onChange={e => { setCodigoInput(e.target.value.toUpperCase()); setCupomErro('') }}
                      onKeyDown={e => e.key === 'Enter' && handleAplicarCupom()}
                    />
                    <button
                      className="cart-cupom-btn"
                      onClick={handleAplicarCupom}
                      disabled={cupomLoading || !codigoInput.trim()}
                    >
                      {cupomLoading ? '...' : 'Aplicar'}
                    </button>
                  </div>
                  {cupomErro && <p className="cart-cupom-erro">{cupomErro}</p>}
                </>
              )}
            </div>

            {/* Totais */}
            <div className="cart-total">
              <span>Subtotal</span>
              <span>R$&nbsp;{total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            {desconto > 0 && (
              <div className="cart-total cart-desconto">
                <span>Desconto</span>
                <span>− R$&nbsp;{desconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="cart-total cart-total-final">
              <span>Total</span>
              <span className="cart-total-val">
                R$&nbsp;{totalFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <button
              className="btn-primary"
              style={{ width: '100%', padding: '16px', textAlign: 'center', opacity: loading ? 0.7 : 1 }}
              onClick={finalizarPedido}
              disabled={loading}
            >
              {loading ? 'Aguarde...' : 'Finalizar Pedido'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
