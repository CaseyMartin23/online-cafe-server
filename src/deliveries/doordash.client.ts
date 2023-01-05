import { v4 as uuid } from "uuid";
import { sign, JwtPayload } from "jsonwebtoken";
import { HttpService, } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { responseHandler } from "src/utils/responseHandling.util";

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
  private refreshTokenCounter: number = 0;
  private httpService = new HttpService()

  constructor() {
    this.doordashToken = this.generateAuthJWT();
  }

  public async getDeliveryQuote(deliveryQuoteData: DoordashQuoteData) {
    try {
      const url = `${process.env.DOORDASH_API_URL}quotes`;
      const options = {
        headers: {
          Authorization: `Bearer ${this.doordashToken}`,
        },
      };
      const body = {
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
      };
      
      const response = this.httpService.post(url, body, options);
      const { data } = await firstValueFrom(response)
      return responseHandler(true, { items: [data]});
    } catch (err) {
      await this.handleExpiredJWT(err, deliveryQuoteData);
      return responseHandler(false, err);
    }

  }

  public async createDelivery() {
    // create an actually delivery
    // save important data from response
  }

  private generateAuthJWT() {
    const data = {
      aud: 'doordash',
      iss: process.env.DOORDASH_DEVELOPER_ID,
      kid: process.env.DOORDASH_KEY_ID,
    } as JwtPayload;
    const secret = Buffer.from(process.env.DOORDASH_SIGNING_SECRET, 'base64');
    const options = {
      algorithm: 'HS256',
      header: { 'dd-ver': 'DD-JWT-V1' },
      expiresIn: 1800,
    } as unknown;
    const token = sign(data, secret, options);
    return token;
  }

  private refreshDoordashToken() {
    this.refreshTokenCounter = this.refreshTokenCounter + 1;
    this.doordashToken = this.generateAuthJWT();
  }

  private async handleExpiredJWT(error: any, deliveryQuoteData: DoordashQuoteData) {
    const errorData = error.response.data;
    const isExpiredJWTError = errorData.code === "authentication_error" && errorData.message === "The [exp] is in the past; the JWT is expired";
    const hasRefreshedEnough = this.refreshTokenCounter > 4;

    if (isExpiredJWTError && !hasRefreshedEnough) {
      this.refreshDoordashToken();
      return await this.getDeliveryQuote(deliveryQuoteData);
    }
  }
}