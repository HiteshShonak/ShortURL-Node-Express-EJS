// utils/locationMap.js

const STATE_CODE_MAP = {
    'AN': 'Andaman and Nicobar', 'AP': 'Andhra Pradesh', 'AR': 'Arunachal Pradesh',
    'AS': 'Assam', 'BR': 'Bihar', 'CH': 'Chandigarh', 'CT': 'Chhattisgarh',
    'DD': 'Daman and Diu', 'DL': 'Delhi', 'DN': 'Dadra and Nagar Haveli',
    'GA': 'Goa', 'GJ': 'Gujarat', 'HP': 'Himachal Pradesh', 'HR': 'Haryana',
    'JH': 'Jharkhand', 'JK': 'Jammu and Kashmir', 'KA': 'Karnataka',
    'KL': 'Kerala', 'LA': 'Ladakh', 'LD': 'Lakshadweep', 'MH': 'Maharashtra',
    'ML': 'Meghalaya', 'MN': 'Manipur', 'MP': 'Madhya Pradesh', 'MZ': 'Mizoram',
    'NL': 'Nagaland', 'OR': 'Odisha', 'PB': 'Punjab', 'PY': 'Puducherry',
    'RJ': 'Rajasthan', 'SK': 'Sikkim', 'TN': 'Tamil Nadu', 'TG': 'Telangana',
    'TR': 'Tripura', 'UP': 'Uttar Pradesh', 'UT': 'Uttarakhand', 'WB': 'West Bengal',
    'CA': 'California', 'NY': 'New York', 'TX': 'Texas', 'FL': 'Florida', 'ENG': 'England'
};

const COUNTRY_CODE_MAP = {
    'IN': 'India', 'US': 'United States', 'GB': 'United Kingdom', 'CA': 'Canada',
    'AU': 'Australia', 'DE': 'Germany', 'FR': 'France', 'CN': 'China',
    'JP': 'Japan', 'RU': 'Russia', 'BR': 'Brazil', 'IT': 'Italy',
    'ES': 'Spain', 'NL': 'Netherlands', 'SG': 'Singapore', 'AE': 'UAE',
    'SA': 'Saudi Arabia', 'NP': 'Nepal', 'LK': 'Sri Lanka', 'BD': 'Bangladesh',
    'PK': 'Pakistan', 'ID': 'Indonesia', 'TH': 'Thailand', 'VN': 'Vietnam',
    'PH': 'Philippines', 'MY': 'Malaysia'
};

module.exports = {
    STATE_CODE_MAP,
    COUNTRY_CODE_MAP
};