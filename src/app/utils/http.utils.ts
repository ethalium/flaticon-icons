import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';
import { default as fetch, Response } from 'node-fetch';

export class Http {

  /**
   * Fetches and retrieves the textual content of a response from a given URL.
   *
   * @param {string} url - The URL to request the content from.
   * @param {HttpAgent|HttpsAgent|null} [agent] - Optional HTTP/HTTPS agent for the request, or null for none.
   * @return {Promise<string>} A promise that resolves to the textual content of the response.
   */
  static getText(url: string|URL, agent?: HttpAgent|HttpsAgent|null): Promise<string> {
    return this.get(url, agent).then(response => response.text());
  }

  /**
   * Fetches a JSON object from the specified URL using the provided HTTP or HTTPS agent, if any.
   *
   * @param {string} url - The URL to fetch the JSON from.
   * @param {HttpAgent|HttpsAgent|null} [agent] - Optional HTTP or HTTPS agent used for the request.
   * @return {Promise<T>} A promise that resolves to a JSON object of type T.
   */
  static getJson<T = any>(url: string|URL, agent?: HttpAgent|HttpsAgent|null): Promise<T> {
    return this.get(url, agent).then(response => response.json()) as Promise<T>;
  }

  /**
   * Sends a GET request to the specified URL and returns the response.
   *
   * @param {string} url - The URL to send the GET request to.
   * @param {HttpAgent|HttpsAgent|null} [agent] - The HTTP or HTTPS agent to use for the request. Optional.
   * @return {Promise<Response>} A promise that resolves with the HTTP response object.
   */
  static get(url: string|URL, agent?: HttpAgent|HttpsAgent|null): Promise<Response> {
    return new Promise(async (resolve, reject) => {
      try{

        // execute request
        const response = await fetch(url, {
          agent: agent || undefined,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
          }
        });

        // throw error if response is not okay
        if(!response.ok){
          throw new Error(`HTTP request for URL '${response.url}' failed with status code ${response.status} and message '${response.statusText}'.`);
        }

        // resolve response
        resolve(response);

      }catch(e){
        reject(e);
      }
    });
  }

}