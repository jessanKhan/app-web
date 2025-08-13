module.exports = {
  defaultServerResponse: {
    status: 400,
    message: '',
    body: {}
  },
  productMessage: {
    PRODUCT_CREATED: 'Product Created Successfully',
    PRODUCT_FETCHED: 'Product Fetched Successfully',
    PRODUCT_UPDATED: 'Product Updated Successfully',
    PRODUCT_DELETED: 'Product Deleted Successfully',
    PRODUCT_NOT_FOUND: 'Product Not Found'
  },
  userMessage: {
    SIGNUP_SUCCESS: 'Signup Success',
    LOGIN_SUCCESS: 'Login Success',
    DUPLICATE_EMAIL: 'User already exist with given email',
    USER_NOT_FOUND: 'User not found',
    INVALID_PASSWORD: 'Incorrect Password',
    OTP_SENT: 'OTP sent, will be valid for 10 minutes',
    INVALID_OTP: 'Invalid OTP',
    VALID_OTP: 'OTP Validated',
    LOGOUT_SUCCESS: 'User Logged out',
    NO_ACCOUNT:'No account found using your provided input',
    ACCOUNT_DELETED_REQUEST : 'Your account deletion request accepted. The account and associate data will be deleted in the next 7 working days',
    ACCOUNT_DELETED_REQUEST_EXISTS : 'Account deletion request already submitted for this account.',
    UNSUBSCRIBE: 'Ubsubscribe Successfull'
  },
 genericMessage: {
    INVALID_REQUEST: 'Invalid Request',
    CATEGORY_NOT_FOUND: 'No Category Found',
    CATEGORY_INSERTED: 'Category Inserted',
    CATEGORY_UPDATED: 'Category Updated',
    CATEGORY_DELETED: 'Category Deleted',
    TRY_AGAIN:'TRY AGAIN',
    SONG_NOT_FOUND: 'No Song Found',
    SONG_INSERTED: 'Song Inserted',
    SONG_UPDATED: 'Song Updated',
    SONG_DELETED: 'Song Deleted',
    SONG_FETCHED: 'Song Details Fetched',
    RESOURCE_FOUND: 'Data Found',
    RESOURCE_NOT_FOUND: 'Data Not Found',
    ALLREADY_WISHLISTED: 'Song already in our favourite list',
    INVALID_SONG_REQUEST: 'Invalid Song Request',
    WISHLISTED:'Song added in your favourite list',
    WISHLIST_DELETED:'Song removed from your favourite list',
    DATA_INSERTED: 'Data Inserted',
    DATA_UPDATED: 'Data Updated',
    DATA_DELETED: 'Data Deleted',
    DATA_NOT_FOUND: 'No Data Found',
    DATA_FOUND: 'Data Fetched',
  },
  PlaylistMessage: {
    PLAYLIST_NOT_FOUND : 'Playlist not found'
  },
  requestValidationMessage: {
    BAD_REQUEST: 'Invalid fields',
    TOKEN_MISSING: 'Token missing from header'
  },
  databaseMessage: {
    INVALID_ID: 'Invalid Id'
  }
}