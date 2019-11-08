# GetCoins Application

The idea is to develop a mobile cross-platform application that allows users to exchange FIAT for cryptocurrencies and viceversa using the nearby function like local bitcoins you can see the offers around you and pick your one.

* Users register to the app with SMS pin verification and then can immediately.
* Post BUY and SELL offers geolocalized (point suggested or forced) with also a small description and a timeframe (ex: I will be at LA  Airport tomorrow from 14:00 to 18:00)
* Explore the current nearby offers
* Checking in a different place to explore the offers there
* If is selling cryptocurrencies need to deposit it into our escrow wallet
* If is buy must post a photo with the FIAT + Timestamp to be eligible to contact the seller
* chats are end-to-end encrypted

## API's

## Programing Language & Database 

* [Node.js](https://nodejs.org/en/)
* [MongoDB](https://www.mongodb.com/)

## Framework & Dependencies 

* body-parser 
* express
* geojson
* geospatial
* mongoose
* mongoose-double
* multer
* nodemailer
* validator

## Acknowledgments

* We use [HEROKU](https://dashboard.heroku.com) free hosting for test your api's
BASEURL: https://getcoins.herokuapp.com

* Use [postman](https://www.getpostman.com/) for check apis 

* ##### We declare all messages in a seprate file check all messages and revert back feedback about it.

## Users Action

#### Request URL for Registeration

```
* URL: BASEURL/api/users/register/
* HTTP Methods: POST
* PARAMETERS:  name:John Doe
               image:[image file]
               email:john.doe@mailinator.com
               mobile:4155552671
               password:Test@123
               location:Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France
               latitude:48.8583701
               longitude:2.2922926
               firebase_token:[firbase token generated on device for notification]
```
* User wallet is also created at the time of registeration.

#### Request URL for Login

With Mobile
```
* URL: BASEURL/api/users/login/mobile/
* HTTP Methods: GET
* PARAMETERS:  mobile:4155552671
```
* When user try to login with mobile number we will send SMS for that number with generated pin.

With Email & Password
```
* URL: BASEURL/api/users/login/email
* HTTP Methods: GET
* PARAMETERS:  email:john.doe@mailinator.com
               password:Test@123
```

#### Request URL for Verify Pin
```
* URL: BASEURL/api/users/verify/pin/
* HTTP Methods: POST
* PARAMETERS:  source:4155552671
               pin:[pin generated login with mobile number]
```

#### Request URL for Forgot Password

With Mobile
```
* URL: BASEURL/api/users/password/forgot
* HTTP Methods: POST
* PARAMETERS: source:4155552671
```

With Email & Password
```
* URL: BASEURL/api/users/password/forgot
* HTTP Methods: POST
* PARAMETERS:  source:john.doe@mailinator.com
```

#### Request URL for Change Password

With Email
```
* URL: BASEURL/api/users/password/change
* HTTP Methods: POST
* PARAMETERS:  source:john.doe@mailinator.com
               old_password:Test@123
               new_password:Test@125
```

#### Request URL for Update Password

With User
```
* URL: BASEURL/api/users/update/password/
* HTTP Methods: POST
* PARAMETERS:  user_id:[return in response of login api]
               old_password:Test@123
               new_password:Test@125
```

#### Request URL for Users within a specific distance 

```
* URL: BASEURL/api/users/list
* HTTP Methods: GET
* PARAMETERS:  latitude:48.8583701
               longitude:2.2922926
               distance:5
```

#### Request URL for Profile 

```
* URL: BASEURL/api/users/profile
* HTTP Methods: GET
* PARAMETERS:  user_id:[return in response of login api]
```

#### Request URL for Update Language

```
* URL: BASEURL/api/users/update/language/
* HTTP Methods: POST
* PARAMETERS:  user_id:[return in response of login api]
               language:Malayalam
               language_code:mal
```

#### Request URL for Update Location

```
* URL: BASEURL/api/users/update/location/
* HTTP Methods: POST
* PARAMETERS:  user_id:[return in response of login api]
               location:10 Rue du Général Camou, 75007 Paris, France
               latitude:48.8583701
               longitude:2.2922926
```

#### Request URL for mark user active or inactive

```
* URL: BASEURL/api/users/status/action
* HTTP Methods: POST
* PARAMETERS:  user_id:[return in response of login api]
```

## Feedback Action

#### Request URL for Feedback 

```
* URL: BASEURL/api/feedbacks/create/
* HTTP Methods: POST
* PARAMETERS:  user_id:[return in response of login api]
               feed:[feedback]
```

## Notification Action

#### Request URL for Notifications 

```
* URL: BASEURL/api/notifications/list
* HTTP Methods: GET
* PARAMETERS:  user_id:[return in response of login api]
```

## Offer Action

#### Request URL for Create Offers  

```
* URL: BASEURL/api/offers/create
* HTTP Methods: POST
* PARAMETERS:  user_id:[return in response of login api]
               quantity:3
               currency_id:[return in response of currency list api]
               type:[buy or sell]
               location:Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France
               latitude:48.8583701
               longitude:2.2922926
               exchange_rate:250000
```

* When user create offer in particular location, push notification are generated for nearest users.

#### Request URL for Offers  

```
* URL: BASEURL/api/offers
* HTTP Methods: GET
* PARAMETERS:  user_id:[return in response of login api]
```

#### Request URL for Offers Action(accept or reject meeting) 

```
* URL: BASEURL/api/offers/action/
* HTTP Methods: POST
* PARAMETERS:  to_user_id:[receiver of message]
               for_user_id:[sender of message]
               offer_id:[offer id for which meeting action is taken]
               action:[0-reject, 1-accept]
```
* When meeting accept & reject, notification is generated for both of receiver & sender.

## Chat Action

#### Request URL for send message  

```
* URL: BASEURL/api/chats/send
* HTTP Methods: POST
* PARAMETERS:  to_user_id:[receiver of message]
               for_user_id:[sender of message]
               body:[body/message]
```

#### Request URL for chat between users 
```
* URL: BASEURL/api/chats
* HTTP Methods: GET
* PARAMETERS: to_user_id=[receiver of message]
              for_user_id=[sender of message]
```

#### Request URL for recent chat users 
```
* URL: BASEURL/api/chats/users
* HTTP Methods: GET
* PARAMETERS: user_id=[user_id]
```

## Deal Action

#### Request URL for Deal Listing  

```
* URL: BASEURL/api/deals
* HTTP Methods: GET
* PARAMETERS:  user_id:[user id for deal is create]
```

#### Request URL for Deals Action(success or decline deal) 

```
* URL: BASEURL/api/deals/action
* HTTP Methods: POST
* PARAMETERS:  to_user_id:[receiver of message]
               for_user_id:[sender of message]
               offer_id:[offer id for which meeting action is taken]
               action:[0-reject, 1-accept]
```
* When deal success & decline, notification is generated for both of receiver & sender.

## Wallet Action

#### Request URL for wallet balance 

```
* URL: BASEURL/api/wallets/balance
* HTTP Methods: GET
* PARAMETERS:  user_id:[user id for wallet is create]
```

#### Request URL for wallet make payment 

```
* URL: BASEURL/api/wallets/payment/
* HTTP Methods: POST
* PARAMETERS: deal_id: [deal id for which make payment]
```

## Other Action 

```
Exchange Rates API (Market Prices and exchanges rates api)
URL: https://blockchain.info/ticker
Returns a JSON object with the currency codes as keys. 
    * "15m" is the 15 minutes delayed market price, 
    * "last" is the most recent market price, 
    * "symbol" is the currency symbol.
```

#### Request URL for Market Price 
```
* URL: BASEURL/api/cryptocurrency/marketprice/
* HTTP Methods: GET
* PARAMETERS: [no parameter]
```

## Admin API's 
### Currency Action

#### Request URL for Create Currency  

```
* URL: BASEURL/api/currencies/create
* HTTP Methods: POST
* PARAMETERS:  currency:Bitcoin
               symbol:BTC
```

#### Request URL for Currency List  

```
* URL: BASEURL/api/currencies
* HTTP Methods: GET
* PARAMETERS: [no parameter]
```
