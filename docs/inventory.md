# Inventory module

NGO-scoped stock, receipts, issues, resource requests, and history.

## Overview

Each inventory record belongs to **one NGO**. Quantity is maintained as:

**Opening + Received + Returns + Increases − Issues − Distributions − Decreases = Current stock**

Stock cannot go below zero. Every quantity change writes a `StockTransaction` row (`quantityBefore` / `quantityAfter`). Transaction history is not editable from the UI.

Operational flow:

**Supplier → Receipt → Inventory item quantity ↑ → Resource request (pending) → Approve (no stock change) → Issue → Quantity ↓ → Transaction history**

## Routes / pages

| Path | Who | Purpose |
| --- | --- | --- |
| `/inventory` | NGO Admin, store officer | Dashboard: totals, low/out of stock, recent activity |
| `/inventory/items` | NGO Admin | Item CRUD, search, filters |
| `/inventory/categories` | NGO Admin | Category CRUD; in-use categories are archived |
| `/inventory/transactions` | NGO Admin, store officer | Read-only history |
| `/inventory/transfers` | NGO Admin | Site-to-site transfer record (total qty unchanged) |
| `/inventory/adjustments` | NGO Admin | Increase/decrease with reason |
| `/suppliers` | NGO Admin | Supplier directory |
| `/purchases/receiving` | NGO Admin | Receive stock (increases quantity) |
| `/purchases` | NGO Admin | Receipt/purchase list |
| `/purchases/orders` | NGO Admin | Same receipts by reference |
| `/resource-requests` | NGO Admin + workers | Create requests; admin approve/reject/issue |
| `/distribution` | NGO Admin, store officer | Direct stock issue |
| `/reports/inventory` | NGO Admin | Stock vs received/issued |
| `/reports/distribution` | NGO Admin | Issued quantities |

## API endpoints

All routes require an authenticated NGO session and filter by `session.user.ngoId`.

| Method | Path | Access |
| --- | --- | --- |
| GET | `/api/ngo/inventory/overview` | view |
| GET/POST | `/api/ngo/inventory/categories` | view / manage |
| PATCH/DELETE | `/api/ngo/inventory/categories/[id]` | manage |
| GET/POST | `/api/ngo/inventory/items` | view or request / manage |
| GET/PATCH/DELETE | `/api/ngo/inventory/items/[id]` | view / manage |
| GET | `/api/ngo/inventory/transactions` | view |
| GET/POST | `/api/ngo/inventory/receive` | view / manage |
| GET/POST | `/api/ngo/inventory/issue` | view / issue or manage |
| GET/POST | `/api/ngo/inventory/adjustments` | view / manage |
| GET/POST | `/api/ngo/inventory/transfers` | view / manage |
| GET/POST | `/api/ngo/inventory/requests` | request (workers see own) |
| GET/PATCH | `/api/ngo/inventory/requests/[id]` | request GET; manage PATCH (`approve`, `reject`, `issue`) |
| GET/POST | `/api/ngo/inventory/suppliers` | manage |
| PATCH/DELETE | `/api/ngo/inventory/suppliers/[id]` | manage |
| GET | `/api/ngo/inventory/reports` | view |

`manage` = NGO Admin. `view` = admin or `inventory.view` / `distribution.view`. `request` = any NGO worker or admin. `issue` = admin or `distribution.view`.

## Database models

- `InventoryCategory` — NGO-unique name
- `InventoryItem` — unique `(ngoId, sku)`; `quantity`, `minLevel`, optional project/site/category
- `StockTransaction` — immutable history
- `ReceivingRecord` — receipt linked to item + supplier
- `Supplier` — NGO vendors
- `Purchase` — cost snapshot created on receipt when unit cost is provided
- `ResourceRequest` — pending → approved/rejected → issued
- `DistributionRecord` — issues
- `StockAdjustment` / `StockTransfer`

Migration: `20260903180000_inventory_module`.

## Workflows

**Receive:** validate NGO item + supplier/project/site → increment quantity in a DB transaction → `StockTransaction` type `received` → `ReceivingRecord` (+ `Purchase` if cost).

**Issue / distribution:** reject if `quantity > on hand` (atomic `updateMany` with `quantity gte`) → decrement → history + `DistributionRecord`.

**Request:** create does **not** change stock. Approve/reject does **not** change stock. Issue on an approved request deducts stock.

**Adjustment:** signed delta; blocked if result would be negative.

**Transfer:** records from-site → to-site. On-hand total is NGO-level (one quantity per item), so transfer does not change the total.

## Roles and isolation

- NGO Admin manages their NGO only.
- Store / logistics officers with `inventory.view` see stock and history.
- Workers create resource requests only for their NGO (and assigned project/site when those IDs are set).
- Cross-NGO IDs return 404 / validation errors. Frontend filters are not the security boundary.

## Project / site

Optional on items, receipts, issues, and requests. If both are sent, the site must belong to that project and the same NGO.
