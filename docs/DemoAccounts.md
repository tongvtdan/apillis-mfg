# Demo Accounts Documentation

## Overview
This document contains all demo accounts available in the Factory Pulse system for testing and demonstration purposes.

**Total Accounts:** 25  
**Created:** August 30-31, 2025  
**Default Password:** `FactoryPulse@2025` (for all accounts)

---

## Factory Pulse Internal Users

### Executive & Management
| Email                        | Role                    | ID                                     |
| ---------------------------- | ----------------------- | -------------------------------------- |
| `admin@factorypulse.vn`      | System Administrator    | `a3b8e7b3-f0d9-4edd-abd4-ec78f3816d11` |
| `ceo@factorypulse.vn`        | Chief Executive Officer | `ceafa7d8-dda2-4645-b253-894839eee7b3` |
| `operations@factorypulse.vn` | Operations Manager      | `497809e4-7429-437c-a81c-6f43e2fa77c1` |

### Engineering Team
| Email                                 | Role                | ID                                     |
| ------------------------------------- | ------------------- | -------------------------------------- |
| `senior.engineer@factorypulse.vn`     | Senior Engineer     | `00474d04-fe69-4823-91f2-c74b96c5c958` |
| `mechanical.engineer@factorypulse.vn` | Mechanical Engineer | `80034f6f-b520-4bf4-9197-0379588b976e` |
| `electrical.engineer@factorypulse.vn` | Electrical Engineer | `da918e06-7480-4b36-8368-456db3fba638` |
| `qa.engineer@factorypulse.vn`         | QA Engineer         | `a53f503d-ad74-4397-a3f1-5ee9c3e61d34` |

### Production & Quality
| Email                                   | Role                  | ID                                     |
| --------------------------------------- | --------------------- | -------------------------------------- |
| `production.supervisor@factorypulse.vn` | Production Supervisor | `30951eed-46a0-441b-8abf-fbf0e6be127c` |
| `team.lead@factorypulse.vn`             | Team Lead             | `6e6d4947-84b6-41e9-888c-3cf1a3480743` |
| `quality.inspector@factorypulse.vn`     | Quality Inspector     | `27ec8d55-a5d7-476c-9998-fe3fbafb509f` |
| `quality@factorypulse.vn`               | Quality Manager       | `a161659d-d39c-4f98-aa90-208f0a80e0cc` |

### Business Operations
| Email                                 | Role                | ID                                     |
| ------------------------------------- | ------------------- | -------------------------------------- |
| `sales.manager@factorypulse.vn`       | Sales Manager       | `6e8fc313-fd4b-4aa5-95b1-9021e2483d3a` |
| `procurement@factorypulse.vn`         | Procurement Manager | `2de25409-78d3-4892-b4d3-9fbc252bc674` |
| `project.coordinator@factorypulse.vn` | Project Coordinator | `9cb57c45-c9e7-4cff-b40b-53e14d13c6e9` |
| `customer.service@factorypulse.vn`    | Customer Service    | `d8fa56d6-2b38-4e76-8425-d1daad896f51` |

---

## Customer & Partner Accounts

### Automotive Industry
| Email                   | Company        | ID                                     |
| ----------------------- | -------------- | -------------------------------------- |
| `procurement@toyota.vn` | Toyota Vietnam | `a53f503d-ad74-4397-a3f1-5ee9c3e61d34` |
| `purchasing@honda.vn`   | Honda Vietnam  | `550e8400-e29b-41d4-a716-446655440102` |

### Aerospace Industry
| Email                    | Company        | ID                                     |
| ------------------------ | -------------- | -------------------------------------- |
| `supply.chain@boeing.vn` | Boeing Vietnam | `550e8400-e29b-41d4-a716-446655440103` |
| `procurement@airbus.vn`  | Airbus Vietnam | `550e8400-e29b-41d4-a716-446655440104` |

### Electronics Industry
| Email                   | Company         | ID                                     |
| ----------------------- | --------------- | -------------------------------------- |
| `purchasing@samsung.vn` | Samsung Vietnam | `550e8400-e29b-41d4-a716-446655440105` |

### Manufacturing Partners
| Email                           | Company                  | ID                                     |
| ------------------------------- | ------------------------ | -------------------------------------- |
| `sales@precision-machining.vn`  | Precision Machining Co.  | `550e8400-e29b-41d4-a716-446655440106` |
| `info@metal-fabrication.vn`     | Metal Fabrication Ltd.   | `550e8400-e29b-41d4-a716-446655440107` |
| `sales@assembly-solutions.vn`   | Assembly Solutions Inc.  | `550e8400-e29b-41d4-a716-446655440108` |
| `info@surface-finishing.vn`     | Surface Finishing Corp.  | `550e8400-e29b-41d4-a716-446655440109` |
| `sales@electronics-assembly.vn` | Electronics Assembly Co. | `550e8400-e29b-41d4-a716-446655440110` |

---

## Login Information

### Default Credentials
- **Username:** Email address (as listed above)
- **Password:** `FactoryPulse@2025`
- **Authentication:** Email/Password via Supabase Auth

### Access Levels
- **Internal Users:** Full access to Factory Pulse features
- **Customer Accounts:** Limited access to project-specific data and communications
- **Partner Accounts:** Access to relevant manufacturing and supply chain modules

### Recent Activity
Most accounts show recent login activity, indicating active usage of the demo system.

---

## Usage Notes

1. **Testing:** These accounts are intended for demonstration and testing purposes
2. **Data:** Each account has associated demo data including projects, documents, and activity logs
3. **Permissions:** Role-based access control is implemented for different user types
4. **Security:** Default passwords should be changed in production environments

---

## Database Query
To verify accounts in the database:
```sql
SELECT id, email, created_at, updated_at, email_confirmed_at, last_sign_in_at 
FROM auth.users 
ORDER BY created_at DESC;
```

---

*Last Updated:* September 3, 2025  
*Total Accounts:* 25  
*System:* Factory Pulse Manufacturing Management Platform
