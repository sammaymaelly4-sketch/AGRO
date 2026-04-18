// =====================================================
// SENTINELA AGRO ERP — Componentes Reutilizáveis
// =====================================================

import { ICONS, getInitials } from './utils.js';
import { signOut, isAdmin } from './auth.js';

// ========== SIDEBAR ==========

/**
 * Renderiza a sidebar de navegação
 * @param {string} activePage - Identificador da página ativa
 */
export function renderSidebar(activePage) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: ICONS.dashboard, href: '/dashboard.html' },
    { type: 'separator', label: 'Operações' },
    { id: 'vendas', label: 'Vendas', icon: ICONS.vendas, href: '/vendas.html' },
    { id: 'clientes', label: 'Clientes', icon: ICONS.clientes, href: '/clientes.html' },
    { id: 'produtos', label: 'Produtos', icon: ICONS.produtos, href: '/produtos.html' },
    { type: 'separator', label: 'Gestão' },
    { id: 'estoque', label: 'Estoque', icon: ICONS.estoque, href: '/estoque.html' },
    { id: 'financeiro', label: 'Financeiro', icon: ICONS.financeiro, href: '/financeiro.html' },
  ];

  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';
  sidebar.id = 'sidebar';

  const collapsed = localStorage.getItem('sidebar_collapsed') === 'true';
  if (collapsed) sidebar.classList.add('collapsed');

  sidebar.innerHTML = `
    <div class="sidebar-logo">
      <div class="logo-icon">🌿</div>
      <div>
        <div class="logo-text">Sentinela Agro</div>
        <div class="logo-subtitle">Sistema ERP</div>
      </div>
    </div>
    <nav class="sidebar-nav">
      ${navItems.map(item => {
        if (item.type === 'separator') {
          return `<div class="nav-section-label">${item.label}</div>`;
        }
        return `
          <a href="${item.href}" class="nav-item ${activePage === item.id ? 'active' : ''}" data-page="${item.id}">
            <span class="nav-icon">${item.icon}</span>
            <span class="nav-label">${item.label}</span>
          </a>
        `;
      }).join('')}
    </nav>
    <div class="sidebar-footer">
      <button class="sidebar-toggle" id="sidebarToggle" title="Recolher menu">
        ${ICONS.chevronLeft}
        <span class="nav-label">Recolher</span>
      </button>
    </div>
  `;

  document.body.querySelector('.app-layout')?.prepend(sidebar) 
    || document.body.prepend(sidebar);

  // Toggle sidebar
  document.getElementById('sidebarToggle').addEventListener('click', () => {
    const sb = document.getElementById('sidebar');
    sb.classList.toggle('collapsed');
    const isCollapsed = sb.classList.contains('collapsed');
    localStorage.setItem('sidebar_collapsed', isCollapsed);
    
    // Atualiza topbar e main content
    document.querySelector('.topbar')?.classList.toggle('sidebar-collapsed', isCollapsed);
    document.querySelector('.main-content')?.classList.toggle('sidebar-collapsed', isCollapsed);
  });

  return sidebar;
}

// ========== TOPBAR ==========

/**
 * Renderiza a topbar
 * @param {Object} config - { title, subtitle, user }
 */
export function renderTopbar({ title, subtitle, user }) {
  const collapsed = localStorage.getItem('sidebar_collapsed') === 'true';
  const initials = getInitials(user?.name || user?.email || '?');

  const topbar = document.createElement('header');
  topbar.className = `topbar ${collapsed ? 'sidebar-collapsed' : ''}`;
  topbar.id = 'topbar';

  topbar.innerHTML = `
    <div class="topbar-left">
      <button class="topbar-btn mobile-menu-btn" id="mobileMenuBtn" style="display:none">
        ${ICONS.menu}
      </button>
      <div>
        <div class="topbar-title">${title || ''}</div>
        ${subtitle ? `<div class="topbar-breadcrumb">${subtitle}</div>` : ''}
      </div>
    </div>
    <div class="topbar-search">
      <span class="search-icon">${ICONS.search}</span>
      <input type="text" placeholder="Buscar..." id="globalSearch" />
    </div>
    <div class="topbar-right">
      <button class="topbar-btn" id="notificationsBtn" title="Notificações">
        ${ICONS.bell}
      </button>
      <div class="user-menu" style="position:relative">
        <div class="user-avatar" id="userAvatarBtn" title="${user?.name || ''}">${initials}</div>
        <div class="user-dropdown" id="userDropdown" style="display:none;position:absolute;top:44px;right:0;background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:8px;min-width:200px;box-shadow:var(--shadow-xl);z-index:50">
          <div style="padding:12px 16px;border-bottom:1px solid var(--border-color);margin-bottom:8px">
            <div style="font-weight:600;font-size:14px">${user?.name || 'Usuário'}</div>
            <div style="font-size:12px;color:var(--text-muted)">${user?.email || ''}</div>
            <span class="badge badge-${user?.role === 'admin' ? 'success' : 'info'}" style="margin-top:6px">${user?.role === 'admin' ? 'Admin' : 'Vendedor'}</span>
          </div>
          <button class="nav-item" id="logoutBtn" style="width:100%;color:var(--accent-red)">
            <span class="nav-icon">${ICONS.logout}</span>
            <span>Sair</span>
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.querySelector('.main-content')?.prepend(topbar)
    || document.body.prepend(topbar);

  // Mobile menu button
  const mobileBtn = document.getElementById('mobileMenuBtn');
  if (window.innerWidth <= 768) {
    mobileBtn.style.display = 'flex';
  }
  window.addEventListener('resize', () => {
    mobileBtn.style.display = window.innerWidth <= 768 ? 'flex' : 'none';
  });
  mobileBtn.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.toggle('mobile-open');
  });

  // User dropdown
  const avatarBtn = document.getElementById('userAvatarBtn');
  const dropdown = document.getElementById('userDropdown');
  avatarBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  });
  document.addEventListener('click', () => {
    dropdown.style.display = 'none';
  });

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    signOut();
  });

  return topbar;
}

// ========== TOASTS ==========

let toastContainer = null;

function ensureToastContainer() {
  if (!toastContainer || !document.body.contains(toastContainer)) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    toastContainer.id = 'toastContainer';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

/**
 * Mostra toast de notificação
 * @param {string} message - Mensagem
 * @param {'success'|'error'|'warning'|'info'} type - Tipo
 * @param {number} duration - Duração em ms (default 4000)
 */
export function showToast(message, type = 'info', duration = 4000) {
  const container = ensureToastContainer();
  
  const iconMap = {
    success: ICONS.check,
    error: ICONS.close,
    warning: ICONS.alert,
    info: ICONS.info
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${iconMap[type]}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.classList.add('removing'); setTimeout(() => this.parentElement.remove(), 250)">
      ${ICONS.close}
    </button>
    <div class="toast-progress" style="animation-duration: ${duration}ms"></div>
  `;

  container.appendChild(toast);

  // Auto-remove
  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 250);
    }
  }, duration);

  return toast;
}

// ========== MODAL ==========

/**
 * Cria e exibe modal
 * @param {Object} config - { title, content, size, onClose, footer }
 * @returns {Object} - { element, close }
 */
export function showModal({ title, content, size = 'md', onClose, footer }) {
  // Remove modal existente
  document.querySelector('.modal-overlay')?.remove();

  const maxWidths = { sm: '420px', md: '560px', lg: '720px', xl: '900px' };

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width: ${maxWidths[size] || maxWidths.md}">
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close" id="modalCloseBtn">${ICONS.close}</button>
      </div>
      <div class="modal-body">
        ${typeof content === 'string' ? content : ''}
      </div>
      ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
    </div>
  `;

  document.body.appendChild(overlay);

  // Se content é um elemento DOM
  if (typeof content !== 'string' && content instanceof HTMLElement) {
    overlay.querySelector('.modal-body').innerHTML = '';
    overlay.querySelector('.modal-body').appendChild(content);
  }

  // Anima abertura
  requestAnimationFrame(() => {
    overlay.classList.add('active');
  });

  const close = () => {
    overlay.classList.remove('active');
    setTimeout(() => {
      overlay.remove();
      onClose?.();
    }, 250);
  };

  // Fechar ao clicar no X ou fora
  overlay.querySelector('#modalCloseBtn').addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  // ESC para fechar
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      close();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  return { element: overlay, close, body: overlay.querySelector('.modal-body') };
}

// ========== CONFIRM DIALOG ==========

/**
 * Mostra diálogo de confirmação
 * @param {Object} config - { title, message, type, confirmText, cancelText }
 * @returns {Promise<boolean>}
 */
export function showConfirm({ title = 'Confirmar', message, type = 'warning', confirmText = 'Confirmar', cancelText = 'Cancelar' }) {
  return new Promise((resolve) => {
    const iconMap = {
      danger: `<div class="confirm-icon danger">${ICONS.alert}</div>`,
      warning: `<div class="confirm-icon warning">${ICONS.alert}</div>`,
    };

    const { element, close } = showModal({
      title,
      content: `
        ${iconMap[type] || iconMap.warning}
        <p class="confirm-message">${message}</p>
      `,
      size: 'sm',
      footer: `
        <button class="btn btn-secondary" id="confirmCancel">${cancelText}</button>
        <button class="btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'}" id="confirmOk">${confirmText}</button>
      `,
      onClose: () => resolve(false)
    });

    element.classList.add('confirm-dialog');
    
    element.querySelector('#confirmCancel').addEventListener('click', () => {
      close();
      resolve(false);
    });

    element.querySelector('#confirmOk').addEventListener('click', () => {
      close();
      resolve(true);
    });
  });
}

// ========== DATA TABLE ==========

/**
 * Renderiza tabela de dados com pesquisa, paginação e ações
 * @param {Object} config
 */
export function renderDataTable({
  containerId,
  title,
  columns,
  data,
  searchFields = [],
  pageSize = 10,
  actions = [],
  onAdd,
  addLabel = 'Novo',
  emptyMessage = 'Nenhum registro encontrado',
  emptyIcon = '📋'
}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let filteredData = [...data];
  let currentPage = 1;
  let searchTerm = '';

  function applyFilter() {
    if (!searchTerm) {
      filteredData = [...data];
    } else {
      const term = searchTerm.toLowerCase();
      filteredData = data.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          return value && String(value).toLowerCase().includes(term);
        })
      );
    }
    currentPage = 1;
    renderTable();
  }

  function renderTable() {
    const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
    const start = (currentPage - 1) * pageSize;
    const pageData = filteredData.slice(start, start + pageSize);

    container.innerHTML = `
      <div class="table-container">
        <div class="table-header">
          <div class="table-header-title">${title} <span style="color:var(--text-muted);font-weight:400">(${filteredData.length})</span></div>
          <div class="table-actions">
            ${searchFields.length ? `
              <div style="position:relative">
                <span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--text-muted);pointer-events:none">${ICONS.search}</span>
                <input type="text" class="table-search" placeholder="Buscar..." id="${containerId}_search" value="${searchTerm}" />
              </div>
            ` : ''}
            ${onAdd ? `<button class="btn btn-primary" id="${containerId}_add">${ICONS.plus} ${addLabel}</button>` : ''}
          </div>
        </div>
        
        ${pageData.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">${emptyIcon}</div>
            <h3>${emptyMessage}</h3>
            <p>${searchTerm ? 'Tente ajustar o termo de busca' : 'Clique no botão acima para adicionar'}</p>
          </div>
        ` : `
          <div style="overflow-x:auto">
            <table>
              <thead>
                <tr>
                  ${columns.map(col => `<th>${col.label}</th>`).join('')}
                  ${actions.length ? '<th style="text-align:right">Ações</th>' : ''}
                </tr>
              </thead>
              <tbody>
                ${pageData.map((row, idx) => `
                  <tr class="animate-fade-in stagger-${Math.min(idx + 1, 5)}">
                    ${columns.map(col => `
                      <td>${col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}</td>
                    `).join('')}
                    ${actions.length ? `
                      <td style="text-align:right">
                        <div style="display:flex;gap:4px;justify-content:flex-end">
                          ${actions.map(action => {
                            if (action.adminOnly && !isAdmin()) return '';
                            return `<button class="btn btn-ghost btn-icon" title="${action.label}" data-action="${action.id}" data-id="${row.id}">${action.icon}</button>`;
                          }).join('')}
                        </div>
                      </td>
                    ` : ''}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          ${totalPages > 1 ? `
            <div class="table-pagination">
              <span>Mostrando ${start + 1}–${Math.min(start + pageSize, filteredData.length)} de ${filteredData.length}</span>
              <div class="table-pagination-btns">
                <button ${currentPage <= 1 ? 'disabled' : ''} data-page="${currentPage - 1}">${ICONS.chevronLeft}</button>
                ${Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) page = i + 1;
                  else if (currentPage <= 3) page = i + 1;
                  else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                  else page = currentPage - 2 + i;
                  return `<button class="${page === currentPage ? 'active' : ''}" data-page="${page}">${page}</button>`;
                }).join('')}
                <button ${currentPage >= totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">${ICONS.chevronRight}</button>
              </div>
            </div>
          ` : ''}
        `}
      </div>
    `;

    // Event listeners
    const searchInput = document.getElementById(`${containerId}_search`);
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        applyFilter();
      });
      // Foca no campo de busca
      if (searchTerm) searchInput.focus();
    }

    const addBtn = document.getElementById(`${containerId}_add`);
    if (addBtn) {
      addBtn.addEventListener('click', onAdd);
    }

    // Ações
    container.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const actionId = btn.dataset.action;
        const itemId = btn.dataset.id;
        const action = actions.find(a => a.id === actionId);
        const item = data.find(d => d.id === itemId);
        if (action && item) action.handler(item);
      });
    });

    // Paginação
    container.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.dataset.page);
        if (page >= 1 && page <= totalPages) {
          currentPage = page;
          renderTable();
        }
      });
    });
  }

  renderTable();

  // Retorna método para atualizar dados
  return {
    updateData(newData) {
      data = newData;
      applyFilter();
    }
  };
}

// ========== METRIC CARD ==========

/**
 * Renderiza card de métrica
 */
export function renderMetricCard({ icon, iconColor, value, label, trend, trendValue, glowClass }) {
  return `
    <div class="card-glass metric-card ${glowClass || ''}">
      <div class="metric-icon ${iconColor || 'green'}">${icon}</div>
      <div class="metric-value">${value}</div>
      <div class="metric-label">${label}</div>
      ${trend ? `
        <div class="metric-trend ${trend}">
          ${trend === 'up' ? ICONS.trendUp : ICONS.trendDown}
          ${trendValue || ''}
        </div>
      ` : ''}
    </div>
  `;
}

// ========== LOADING ==========

/**
 * Mostra loading skeleton na página
 */
export function showPageLoading(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = `
    <div class="metrics-grid" style="margin-bottom:28px">
      ${Array(4).fill('<div class="skeleton skeleton-card"></div>').join('')}
    </div>
    <div class="skeleton" style="height:400px"></div>
  `;
}

/**
 * Mostra/esconde loading overlay em um elemento
 */
export function setLoading(element, loading) {
  if (!element) return;
  
  if (loading) {
    element.style.position = 'relative';
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = '<div class="spinner spinner-lg"></div>';
    element.appendChild(overlay);
  } else {
    element.querySelector('.loading-overlay')?.remove();
  }
}

// ========== FORM BUILDER ==========

/**
 * Gera HTML de formulário baseado em config
 * @param {Array} fields - [{ name, label, type, required, options, placeholder, value }]
 */
export function buildForm(fields) {
  return fields.map(field => {
    const required = field.required ? 'required' : '';
    const value = field.value ?? '';

    if (field.type === 'row') {
      return `<div class="form-row">${buildForm(field.fields)}</div>`;
    }

    if (field.type === 'select') {
      return `
        <div class="form-group">
          <label class="form-label" for="${field.name}">${field.label}</label>
          <select class="form-select" id="${field.name}" name="${field.name}" ${required}>
            <option value="">Selecione...</option>
            ${(field.options || []).map(opt => 
              `<option value="${opt.value}" ${value === opt.value ? 'selected' : ''}>${opt.label}</option>`
            ).join('')}
          </select>
        </div>
      `;
    }

    if (field.type === 'textarea') {
      return `
        <div class="form-group">
          <label class="form-label" for="${field.name}">${field.label}</label>
          <textarea class="form-textarea" id="${field.name}" name="${field.name}" placeholder="${field.placeholder || ''}" ${required}>${value}</textarea>
        </div>
      `;
    }

    if (field.type === 'toggle') {
      return `
        <div class="form-group">
          <label class="form-switch">
            <input type="checkbox" id="${field.name}" name="${field.name}" ${value ? 'checked' : ''} />
            <span class="switch-track"></span>
            <span>${field.label}</span>
          </label>
        </div>
      `;
    }

    return `
      <div class="form-group">
        <label class="form-label" for="${field.name}">${field.label}</label>
        <input class="form-input" type="${field.type || 'text'}" id="${field.name}" name="${field.name}" 
          placeholder="${field.placeholder || ''}" value="${value}" 
          ${field.step ? `step="${field.step}"` : ''}
          ${field.min !== undefined ? `min="${field.min}"` : ''}
          ${required} />
      </div>
    `;
  }).join('');
}

/**
 * Coleta dados de um formulário dentro de um container
 * @param {HTMLElement} container 
 * @returns {Object}
 */
export function getFormData(container) {
  const data = {};
  container.querySelectorAll('input, select, textarea').forEach(el => {
    if (!el.name) return;
    if (el.type === 'checkbox') {
      data[el.name] = el.checked;
    } else if (el.type === 'number') {
      data[el.name] = el.value ? parseFloat(el.value) : null;
    } else {
      data[el.name] = el.value.trim();
    }
  });
  return data;
}
