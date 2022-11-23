import axios from "axios";
import { v4 as uuid } from "uuid";
import { sign } from "jsonwebtoken";

interface DoordashQuoteData {
  pickupAddress: string;
  pickupBusinessName: string;
  pickupPhoneNumber: string;
  pickupInstructions: string;
  dropoffAddress: string;
  dropoffPhoneNumber: string;
  dropoffInstructions: string;
  dropoffContactGivenName: string;
  dropoffContactFamilyName: string;
}

export class DoordashClient {
  private doordashToken: string;

  constructor() {
    this.doordashToken = this.generateDoordasAuthJWT();
  }

  private generateDoordasAuthJWT() {
    const data = {
      aud: 'doordash',
      iss: process.env.DOORDASH_DEVELOPER_ID,
      kid: process.env.DOORDASH_KEY_ID,
      exp: Math.floor(Date.now() / 1000 + 120),
      iat: Math.floor(Date.now() / 1000),
    }
    const secret = Buffer.from(process.env.DOORDASH_SIGNING_SECRET, 'base64');
    const options = {
      algorithm: 'HS256',
      header: { 'dd-ver': 'DD-JWT-V1' },
    } as unknown
    const token = sign(data, secret, options);
    return token;
  }

  private refreshDoordashToken() {
    this.doordashToken = this.generateDoordasAuthJWT();
  }

  public async getDeliveryQuote(deliveryQuoteData: DoordashQuoteData) {
    console.log("entered getDeliveryQuote")
    try {
      const url = `${process.env.DOORDASH_API_URL}quotes`;
      const body = JSON.stringify({
        external_delivery_id: uuid(),
        pickup_address: deliveryQuoteData.pickupAddress,
        pickup_phone_number: deliveryQuoteData.pickupPhoneNumber,
        pickup_business_name: deliveryQuoteData.pickupBusinessName,
        pickup_instructions: deliveryQuoteData.pickupInstructions,
        dropoff_address: deliveryQuoteData.dropoffAddress,
        dropoff_phone_number: deliveryQuoteData.dropoffPhoneNumber,
        dropoff_instructions: deliveryQuoteData.dropoffInstructions,
        dropoff_contact_given_name: deliveryQuoteData.dropoffContactGivenName,
        dropoff_contact_family_name: deliveryQuoteData.dropoffContactFamilyName,
        currency: "usd",
      })
      // const response = await fetch(url, {
      //   method: "POST",
      //   body,
      //   headers: {
      //     Authorization: `Bearer ${this.doordashToken}`,
      //     'Content-Type': 'application/json',
      //   }
      // })
      // const deliveryQuote = response.json();
      // console.log({ deliveryQuote })

      const response = await axios.post(url, body, {
        headers: {
          Authorization: `Bearer ${this.doordashToken}`,
          'Content-Type': 'application/json',
        }
      });

      console.log({ response });

    } catch (err) {
      console.error(err);
      console.error(err.response.data);

      // handle expired token
      const errorDetails = err.response.data;
      const isExpiredJWTError = errorDetails.code === "authentication_error" && errorDetails.message === "The [exp] is in the past; the JWT is expired";
      if (isExpiredJWTError) {
        this.doordashToken = this.generateDoordasAuthJWT();
        return await this.getDeliveryQuote(deliveryQuoteData);
      }

      return err;
    }
  }
}