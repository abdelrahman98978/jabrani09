# Sovereign Automotive SaaS: MVP Design Document

## 1. Project Overview
This document outlines the architecture and design for transforming the Jabrani Automotive Platform into a multi-tenant SaaS MVP. The platform will serve car dealerships by providing premium showrooms and advanced logistics/manifest management.

## 2. Core Value Proposition
- **High-Fidelity Branding**: Dealers get a premium, institutional look (Obsidian & Gold) with custom branding.
- **Logistics Integration**: Exclusive access to the "Sovereign Manifest" module for tracking global car acquisitions.
- **Seamless Scalability**: Multi-tenant architecture allowing rapid dealer onboarding.

## 3. Architecture Design
- **Frontend**: Next.js/Vite (React) with dynamic environment detection.
- **Backend**: Supabase (PostgreSQL).
- **Tenant Identification**: Shared schema with a `tenant_id` discriminator on all entity tables.
- **Isolation**: Row Level Security (RLS) policies enforcing `tenant_id` checks.
- **Domain Routing**: Vercel Middleware for Custom Domain to Tenant mapping.

## 4. Database Schema Updates
### New Table: `tenants`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid | Primary key |
| `name` | text | Dealership name |
| `slug` | text | Unique URL slug |
| `custom_domain`| text | Custom domain (optional) |
| `plan_tier` | text | `basic`, `pro`, `sovereign` |
| `branding` | jsonb | Store colors, logo, fonts |
| `created_at` | timestamptz | Creation date |

### Updates to Existing Tables
Add `tenant_id` to:
- `cars`
- `brands`
- `orders`
- `manifests`
- `settings`
- `profiles`

## 5. Monetization & Feature Gating
- **Tier 1 (Basic)**: Standard Showroom, Inventory Management.
- **Tier 2 (Pro)**: Custom Branding, Analytics, Advanced SEO.
- **Tier 3 (Sovereign)**: **Logistics & Manifest Module**, Custom Domains, Priority Support.

## 6. Decision Log
1. **Multi-tenancy Model**: Monolithic shared schema chosen for rapid development and maintenance efficiency.
2. **Domain Strategy**: Custom Domains prioritized over subdomains to maintain the "Sovereign" feel.
3. **Data Security**: Strict reliance on Supabase RLS policies for tenant data isolation.
4. **Logistics Gating**: Manifest module restricted to the highest tier to drive high-value conversions.

## 7. Implementation Roadmap
- **Phase 1**: DB Migration (Add `tenants` and `tenant_id` columns).
- **Phase 2**: Identity Middleware (detecting tenant from URL context).
- **Phase 3**: Dynamic Branding implementation (CSS Variables).
- **Phase 4**: Super Admin Dashboard (Dealer management).
- **Phase 5**: Tier-based Feature Gating (Hiding/Showing Manifests).
