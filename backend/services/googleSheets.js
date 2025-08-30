const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');

class GoogleSheetsService {
  constructor() {
    this.auth = null;
    this.sheets = null;
    this.spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    this.sheetName = 'CASPIAN_Coupons';
  }

  async initialize() {
    try {
      // Method 1: Using Service Account JSON (Recommended for production)
      if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
        const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
        this.auth = new google.auth.GoogleAuth({
          credentials,
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
      }
      // Method 2: Using API Key (Limited functionality)
      else if (process.env.GOOGLE_API_KEY) {
        this.auth = process.env.GOOGLE_API_KEY;
      }
      // Method 3: OAuth2 (For development)
      else {
        console.warn('⚠️ No Google credentials found. Please set up Google Sheets API credentials.');
        return false;
      }

      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      
      // Test the connection and create sheet if needed
      await this.ensureSheetExists();
      
      console.log('✅ Google Sheets service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Google Sheets:', error.message);
      return false;
    }
  }

  async ensureSheetExists() {
    try {
      if (!this.spreadsheetId) {
        console.warn('⚠️ No Google Sheets ID provided. Please set GOOGLE_SHEETS_ID in environment variables.');
        return false;
      }

      // Check if the sheet exists
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });

      // Check if our specific sheet tab exists
      const sheetExists = response.data.sheets.some(
        sheet => sheet.properties.title === this.sheetName
      );

      if (!sheetExists) {
        // Create the sheet tab
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId: this.spreadsheetId,
          resource: {
            requests: [{
              addSheet: {
                properties: {
                  title: this.sheetName,
                }
              }
            }]
          }
        });

        // Add headers
        await this.addHeaders();
        console.log(`✅ Created new sheet: ${this.sheetName}`);
      }

      return true;
    } catch (error) {
      console.error('❌ Error ensuring sheet exists:', error.message);
      throw error;
    }
  }

  async addHeaders() {
    try {
      // Check if headers already exist
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A1:I1`,
      });

      const existingHeaders = response.data.values;
      if (existingHeaders && existingHeaders.length > 0) {
        console.log('✅ Headers already exist in Google Sheets');
        return true;
      }

      const headers = [
        'Coupon Code',
        'User Name', 
        'Email',
        'Offer Description',
        'Created At',
        'Expires At',
        'Status',
        'Used At',
        'User ID'
      ];

            await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A1:I1`,
        valueInputOption: 'RAW',
        resource: {
          values: [headers]
        }
      });

      // Format headers
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        resource: {
          requests: [{
            repeatCell: {
              range: {
                sheetId: 0, // Assuming first sheet
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: headers.length
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.2, green: 0.4, blue: 0.8 },
                  textFormat: { 
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    bold: true 
                  }
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)'
            }
          }]
        }
      });

      console.log('✅ Headers added to Google Sheets');
      return true;
    } catch (error) {
      console.error('❌ Error adding headers to Google Sheets:', error.message);
      return false;
    }
  }

  async addCoupon(coupon, user) {
    try {
      if (!this.sheets) {
        console.warn('⚠️ Google Sheets not initialized, skipping...');
        return false;
      }

      // Ensure headers exist
      await this.addHeaders();

      const row = [
        coupon.code,
        user.name,
        user.email,
        coupon.offerDescription,
        new Date(coupon.createdAt).toLocaleString('en-IN'),
        new Date(coupon.expiresAt).toLocaleString('en-IN'),
        'Active',
        '', // Used At
        user._id || user.id
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A:I`,
        valueInputOption: 'RAW',
        resource: {
          values: [row]
        }
      });

      console.log('✅ Coupon added to Google Sheets:', coupon.code);
      return true;
    } catch (error) {
      console.error('❌ Error adding coupon to Google Sheets:', error.message);
      return false;
    }
  }

  async updateCouponStatus(couponCode, status = 'Used') {
    try {
      if (!this.sheets) {
        console.warn('⚠️ Google Sheets not initialized, skipping...');
        return false;
      }

      console.log(`🔄 Updating coupon status in Google Sheets: ${couponCode} -> ${status}`);

      // Get all data to find the row
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A:I`,
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        console.warn('⚠️ No data found in Google Sheets');
        return false;
      }

      console.log(`📊 Found ${rows.length} rows in Google Sheets`);

      // Find the row with the coupon code
      for (let i = 1; i < rows.length; i++) { // Skip header row
        if (rows[i][0] === couponCode) {
          console.log(`🎯 Found coupon at row ${i + 1}, updating status...`);
          
          // Update status and used date
          const updateResponse = await this.sheets.spreadsheets.values.update({
            spreadsheetId: this.spreadsheetId,
            range: `${this.sheetName}!G${i + 1}:H${i + 1}`, // G=Status, H=Used At
            valueInputOption: 'RAW',
            resource: {
              values: [[status, new Date().toLocaleString('en-IN')]]
            }
          });

          console.log(`✅ Updated coupon status in Google Sheets: ${couponCode} -> ${status}`);
          console.log(`📝 Updated cells: G${i + 1}:H${i + 1}`);
          return true;
        }
      }

      console.warn(`⚠️ Coupon not found in Google Sheets: ${couponCode}`);
      console.log(`🔍 Available coupon codes: ${rows.slice(1).map(row => row[0]).join(', ')}`);
      return false;
    } catch (error) {
      console.error('❌ Error updating coupon in Google Sheets:', error.message);
      console.error('Error details:', error);
      return false;
    }
  }

  async getCouponsData() {
    try {
      if (!this.sheets) {
        console.warn('⚠️ Google Sheets not initialized');
        return null;
      }

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A:I`,
      });

      return response.data.values;
    } catch (error) {
      console.error('❌ Error getting coupons from Google Sheets:', error.message);
      return null;
    }
  }

  getSheetUrl() {
    if (this.spreadsheetId) {
      return `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/edit#gid=0`;
    }
    return null;
  }
}

module.exports = new GoogleSheetsService();
