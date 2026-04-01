# Analytics API Examples

## Authentication

All endpoints require authentication. Include JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## 1. Generate Analytics

**Endpoint**: `POST /api/analytics/generate`

**Description**: Generate analytics for a specific panel and time period

**Request Body**:

```json
{
  "panelId": "507f1f77bcf86cd799439011",
  "startDate": "2026-01-01",
  "endDate": "2026-01-31",
  "systemCost": 300000,
  "electricityTariff": 6.5
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "_id": "65abc123def456789012",
    "userId": "507f1f77bcf86cd799439012",
    "panelId": "507f1f77bcf86cd799439011",
    "period": {
      "startDate": "2026-01-01T00:00:00.000Z",
      "endDate": "2026-01-31T23:59:59.999Z"
    },
    "energyProduced": {
      "total": 450.5,
      "daily": [
        { "date": "2026-01-01", "value": 15.2 },
        { "date": "2026-01-02", "value": 14.8 }
      ]
    },
    "financialMetrics": {
      "totalSavings": 2928.25,
      "electricityTariff": 6.5,
      "systemCost": 300000,
      "maintenanceCosts": 0,
      "roi": 0.98,
      "paybackPeriod": 102.5,
      "netSavings": 2928.25
    },
    "carbonFootprint": {
      "co2Avoided": 369.41,
      "treesEquivalent": 16.97,
      "carsOffRoad": 29.32,
      "coalAvoided": 152.65,
      "gridEmissionFactor": 0.82
    },
    "performanceMetrics": {
      "averageEfficiency": 18.5,
      "peakPowerOutput": 4800,
      "systemUptime": 98.5,
      "capacityFactor": 22.3
    }
  }
}
```

---

## 2. Get Analytics

**Endpoint**: `GET /api/analytics`

**Description**: Retrieve analytics data with optional filters

**Query Parameters**:

- `panelId` (optional): Filter by specific panel
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date

**Example Request**:

```
GET /api/analytics?panelId=507f1f77bcf86cd799439011&startDate=2026-01-01&endDate=2026-01-31
```

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "_id": "65abc123def456789012",
      "panelId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Rooftop Panel A",
        "location": "Mumbai"
      },
      "period": {
        "startDate": "2026-01-01T00:00:00.000Z",
        "endDate": "2026-01-31T23:59:59.999Z"
      },
      "energyProduced": { "total": 450.5 },
      "financialMetrics": { ... },
      "carbonFootprint": { ... },
      "performanceMetrics": { ... }
    }
  ]
}
```

---

## 3. Get Cumulative Analytics

**Endpoint**: `GET /api/analytics/cumulative`

**Description**: Get all-time cumulative statistics

**Query Parameters**:

- `panelId` (optional): Filter by specific panel

**Example Request**:

```
GET /api/analytics/cumulative?panelId=507f1f77bcf86cd799439011
```

**Response**:

```json
{
  "success": true,
  "data": {
    "totalEnergyProduced": 5475.5,
    "totalSavings": 35590.75,
    "totalCO2Avoided": 4489.91,
    "totalMaintenanceCosts": 1000,
    "averageROI": 11.53,
    "treesEquivalent": 206.31,
    "carsOffRoad": 356.31,
    "coalAvoided": 1855.33
  }
}
```

---

## 4. Get Cost Savings

**Endpoint**: `GET /api/analytics/cost-savings`

**Description**: Get only financial metrics

**Query Parameters** (all required):

- `panelId`: Panel ID
- `startDate`: Start date
- `endDate`: End date
- `systemCost` (optional): System cost
- `electricityTariff` (optional): Tariff rate (default: 6.5)

**Example Request**:

```
GET /api/analytics/cost-savings?panelId=507f1f77bcf86cd799439011&startDate=2026-01-01&endDate=2026-01-31&systemCost=300000&electricityTariff=6.5
```

**Response**:

```json
{
  "success": true,
  "data": {
    "energyProduced": {
      "total": 450.5,
      "daily": [...]
    },
    "financialMetrics": {
      "totalSavings": 2928.25,
      "electricityTariff": 6.5,
      "systemCost": 300000,
      "maintenanceCosts": 0,
      "roi": 0.98,
      "paybackPeriod": 102.5,
      "netSavings": 2928.25
    }
  }
}
```

---

## 5. Get Carbon Footprint

**Endpoint**: `GET /api/analytics/carbon-footprint`

**Description**: Get only environmental metrics

**Query Parameters** (all required):

- `panelId`: Panel ID
- `startDate`: Start date
- `endDate`: End date

**Example Request**:

```
GET /api/analytics/carbon-footprint?panelId=507f1f77bcf86cd799439011&startDate=2026-01-01&endDate=2026-01-31
```

**Response**:

```json
{
  "success": true,
  "data": {
    "co2Avoided": 369.41,
    "treesEquivalent": 16.97,
    "carsOffRoad": 29.32,
    "coalAvoided": 152.65,
    "gridEmissionFactor": 0.82
  }
}
```

---

## 6. Download PDF Report

**Endpoint**: `GET /api/analytics/report/pdf`

**Description**: Generate and download PDF report

**Query Parameters** (all required):

- `panelId`: Panel ID
- `startDate`: Start date
- `endDate`: End date
- `systemCost` (optional): System cost
- `electricityTariff` (optional): Tariff rate

**Example Request**:

```
GET /api/analytics/report/pdf?panelId=507f1f77bcf86cd799439011&startDate=2026-01-01&endDate=2026-01-31&systemCost=300000&electricityTariff=6.5
```

**Response**: Binary PDF file

**JavaScript Example**:

```javascript
const downloadPDF = async () => {
  const response = await fetch(
    "/api/analytics/report/pdf?" +
      new URLSearchParams({
        panelId: "507f1f77bcf86cd799439011",
        startDate: "2026-01-01",
        endDate: "2026-01-31",
        systemCost: "300000",
        electricityTariff: "6.5",
      }),
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `solar-analytics-${Date.now()}.pdf`;
  a.click();
};
```

---

## 7. Download Excel Report

**Endpoint**: `GET /api/analytics/report/excel`

**Description**: Generate and download Excel report

**Query Parameters**: Same as PDF report

**Example Request**:

```
GET /api/analytics/report/excel?panelId=507f1f77bcf86cd799439011&startDate=2026-01-01&endDate=2026-01-31&systemCost=300000&electricityTariff=6.5
```

**Response**: Binary Excel file (.xlsx)

**JavaScript Example**:

```javascript
const downloadExcel = async () => {
  const response = await fetch(
    "/api/analytics/report/excel?" +
      new URLSearchParams({
        panelId: "507f1f77bcf86cd799439011",
        startDate: "2026-01-01",
        endDate: "2026-01-31",
        systemCost: "300000",
        electricityTariff: "6.5",
      }),
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `solar-analytics-${Date.now()}.xlsx`;
  a.click();
};
```

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Panel ID, start date, and end date are required"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Not authorized"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "No analytics data found"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Failed to generate analytics"
}
```

---

## Frontend Integration Example

```javascript
import { generateAnalytics, downloadPDFReport } from "../api/analytics.api";

const AnalyticsComponent = () => {
  const [analytics, setAnalytics] = useState(null);

  // Generate analytics
  const loadAnalytics = async () => {
    try {
      const response = await generateAnalytics({
        panelId: selectedPanelId,
        startDate: "2026-01-01",
        endDate: "2026-01-31",
        systemCost: 300000,
        electricityTariff: 6.5,
      });

      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Download PDF
  const handleDownloadPDF = async () => {
    try {
      await downloadPDFReport({
        panelId: selectedPanelId,
        startDate: "2026-01-01",
        endDate: "2026-01-31",
        systemCost: 300000,
        electricityTariff: 6.5,
      });
      // File downloads automatically
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <button onClick={loadAnalytics}>Load Analytics</button>
      <button onClick={handleDownloadPDF}>Download PDF</button>
      {/* Display analytics data */}
    </div>
  );
};
```

---

## Testing with cURL

### Generate Analytics

```bash
curl -X POST http://localhost:5000/api/analytics/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "panelId": "507f1f77bcf86cd799439011",
    "startDate": "2026-01-01",
    "endDate": "2026-01-31",
    "systemCost": 300000,
    "electricityTariff": 6.5
  }'
```

### Get Cumulative Analytics

```bash
curl http://localhost:5000/api/analytics/cumulative \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Download PDF

```bash
curl -O http://localhost:5000/api/analytics/report/pdf?panelId=507f1f77bcf86cd799439011&startDate=2026-01-01&endDate=2026-01-31 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Rate Limiting

All API endpoints are subject to rate limiting:

- **Limit**: 100 requests per 15 minutes
- **Headers**:
  - `X-RateLimit-Limit`: Maximum requests
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

---

## Best Practices

1. **Cache Results**: Analytics data doesn't change frequently
2. **Batch Requests**: Generate multiple reports together
3. **Error Handling**: Always handle network errors
4. **Loading States**: Show loading indicators during generation
5. **Validation**: Validate dates and parameters before sending

---

**Happy Analytics! 📊**
