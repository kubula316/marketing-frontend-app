# API Documentation

This document provides a complete reference for the Marketing Application API.

## Base URL
All API endpoints are relative to the base URL: `http://localhost:8080`

---

## 1. Sellers

### Create Seller
- **Endpoint:** `POST /sellers`
- **Description:** Creates a new seller.
- **Request Body:**
  ```json
  {
    "name": "string (mandatory)",
    "initialEmeraldBalance": "number (mandatory, min: 0.00)"
  }
  ```
- **Response:** `201 Created` with `SellerDto`

### List All Sellers
- **Endpoint:** `GET /sellers`
- **Description:** Retrieves a list of all sellers.
- **Response:** `200 OK` with a list of `SellerDto`

### Get Seller Details
- **Endpoint:** `GET /sellers/{sellerId}`
- **Description:** Retrieves details for a specific seller.
- **Path Variable:**
  - `sellerId` (long): The ID of the seller.
- **Response:** `200 OK` with `SellerDto`

### Top-up Seller Account
- **Endpoint:** `POST /sellers/{sellerId}/topup`
- **Description:** Adds funds to a seller's emerald balance.
- **Path Variable:**
  - `sellerId` (long): The ID of the seller.
- **Request Body:**
  ```json
  {
    "amount": "number (mandatory, min: 0.01)"
  }
  ```
- **Response:** `200 OK` with updated `SellerDto`

---

## 2. Products

### Create Product
- **Endpoint:** `POST /products/sellers/{sellerId}/products`
- **Description:** Creates a new product for a specific seller.
- **Path Variable:**
  - `sellerId` (long): The ID of the seller who owns the product.
- **Request Body:**
  ```json
  {
    "name": "string (mandatory)"
  }
  ```
- **Response:** `201 Created` with `ProductDto`

### List Products by Seller
- **Endpoint:** `GET /products/sellers/{sellerId}/products`
- **Description:** Retrieves a list of all products for a specific seller.
- **Path Variable:**
  - `sellerId` (long): The ID of the seller.
- **Response:** `200 OK` with a list of `ProductDto`

### Get Product Details
- **Endpoint:** `GET /products/{productId}`
- **Description:** Retrieves details for a specific product.
- **Path Variable:**
  - `productId` (long): The ID of the product.
- **Response:** `200 OK` with `ProductDto`

---

## 3. Campaigns

### Create Campaign
- **Endpoint:** `POST /campaigns/products/{productId}/campaigns`
- **Description:** Creates a new campaign for a specific product.
- **Path Variable:**
  - `productId` (long): The ID of the product for which the campaign is created.
- **Request Body:**
  ```json
  {
    "campaignName": "string (mandatory)",
    "keywords": ["string", "..."],
    "bidAmount": "number (mandatory, min: 0.01)",
    "campaignFund": "number (mandatory, min: 0.01)",
    "status": "string (ON or OFF)",
    "townId": "long (optional)",
    "radiusKm": "integer (mandatory, min: 1)"
  }
  ```
- **Response:** `201 Created` with `CampaignDto`

### List Campaigns by Product
- **Endpoint:** `GET /campaigns/products/{productId}/campaigns`
- **Description:** Retrieves a list of all campaigns for a specific product.
- **Path Variable:**
  - `productId` (long): The ID of the product.
- **Response:** `200 OK` with a list of `CampaignDto`

### Get Campaign Details
- **Endpoint:** `GET /campaigns/{campaignId}`
- **Description:** Retrieves details for a specific campaign.
- **Path Variable:**
  - `campaignId` (long): The ID of the campaign.
- **Response:** `200 OK` with `CampaignDto`

### Update Campaign
- **Endpoint:** `PUT /campaigns/{campaignId}`
- **Description:** Updates an existing campaign.
- **Path Variable:**
  - `campaignId` (long): The ID of the campaign to update.
- **Request Body:** Same as Create Campaign.
- **Response:** `200 OK` with updated `CampaignDto`

### Delete Campaign
- **Endpoint:** `DELETE /campaigns/{campaignId}`
- **Description:** Deletes a campaign.
- **Path Variable:**
  - `campaignId` (long): The ID of the campaign to delete.
- **Response:** `204 No Content`

---

## 4. Dictionary

### Get All Towns
- **Endpoint:** `GET /dictionary/towns`
- **Description:** Retrieves a list of all available towns.
- **Response:** `200 OK` with a list of `TownDto` (`{ "id": long, "name": "string" }`)

### Search Keywords
- **Endpoint:** `GET /dictionary/keywords`
- **Description:** Searches for keywords based on a query string (typeahead).
- **Query Parameter:**
  - `query` (string, optional): The search term.
- **Response:** `200 OK` with a list of `KeywordDto` (`{ "id": long, "value": "string" }`)
