# Lifed Healthmate Onboarding Manager — User Tutorial

Welcome to the **Lifed Healthmate Onboarding Manager**! This tutorial will guide you through the core functionalities of the system, how to interpret your dashboards, and how to manage users and health partners.

---

## 1. System Functionality Overview

The **Onboarding Manager** is a centralized Operations and CRM platform designed to streamline how your team manages healthcare partners (Healthmates) and end clients (Service Users). 

It solves the chaos of offline spreadsheets by providing:
* **A Visual Kanban Pipeline** to drag-and-drop partners through 5 onboarding stages.
* **Automated Compliance Checklists** to ensure regulatory files are uploaded and reviewed.
* **One-Click Communication** to send emails and WhatsApp messages to partners directly from the app.
* **Dedicated Analytics Dashboards** to monitor sales, marketing, and website traffic.

---

## 2. Navigating the Dashboards

The system provides tailored dashboards to give you a high-level view of your business performance. You can access these from the main sidebar.

### Admin Space (`Admin Dashboard`)
This is your single operating view for performance metrics. 
* **What you'll see:** 
  * **Website Visitors:** High-level traffic metrics (Organic, Social, Referral). *(Note: Currently pending GA4 API integration).*
  * **Qualified Leads:** Leads generated from your enquiries.
  * **Bookings & Gross Booking Value:** Total confirmed bookings and overall revenue across all programs.
  * **Lifed Commission:** Your net realized income based on a 15% margin.
* **Log Book:** A secondary tab in the Admin Space allows you to view a chronological feed of recent system activity and sessions.

### Sales & Marketing Dashboard
A dedicated view for your growth metrics.
* **What you'll see:** Active Campaigns, Conversion Rates (Lead to Booking), Average Customer Acquisition Cost (CAC), Return on Ad Spend (ROAS), and your Top Programs based on recent bookings.
* **Interactivity:** You can click on any KPI card (like "Est. ROAS" or "Active Campaigns") to highlight it and view deeper sub-metrics.

---

## 3. How to Add a Healthmate (Partner)

Healthmates (Practitioners, Centres, or Organizers) are the core partners moving through your pipeline. There are two ways they enter the system:

### Method 1: Manual Addition (By Operations Agent)
1. Navigate to the **Pipeline Board** from the sidebar.
2. Click the **"+ Add Healthmate"** button (usually located near the top of the Kanban board).
3. Fill in the required details: Name, Email, Phone Number, and Category.
4. Once saved, a new card will instantly appear in the **`PRE_QUALIFY`** (first) column of your Kanban board.

### Method 2: Automated Webhook (Client Registration)
* When a prospective partner submits a registration form on your public website, the system automatically catches a webhook.
* This automatically creates their profile and places them into the **`REGISTER`** phase, immediately seeding their required compliance tasks so your team can begin review.

---

## 4. Managing Enquiries & Service Users (End Clients)

While Healthmates are your partners, **Service Users** are the end-clients booking services.

### Handling Enquiries
1. Navigate to the **Enquiries** section.
2. Here you will see a list of inbound leads.
3. If an enquiry is qualified, you can click the **Promote** button. 
   * If they are a partner, they will be promoted to the Healthmate Pipeline.
   * If they are a client, they will be promoted to your **Service Users** CRM.

### Managing Service Users
1. Go to the **Service Users** tab.
2. Here you can manually add a new client or click on an existing one to open their detailed profile drawer.
3. Inside the profile, you can navigate tabs to manage their **Bookings**, process **Payments** (tracked in `₹` INR), and handle **Support Tickets**.

---

## 5. Reviewing Website Traffic, Sales, and Growth

To review your traffic and financial growth:
1. Open the sidebar and click on the **Sales & Marketing** or **Admin Space** tabs.
2. Look at the top row of **KPI Cards**.
3. **For Traffic:** Check the "Website visitors" card. It breaks down traffic by source (Organic vs Paid).
4. **For Sales:** Check the "Gross Booking Value" and "Bookings" cards. 
5. **Detailed Insights:** Clicking on a card will expand its details, allowing you to see which specific programs are driving your revenue and how much you are spending on acquisition.

---
*End of Tutorial. For technical specifics on how these components communicate, please refer to the `LEARNING_GUIDE.md`.*
