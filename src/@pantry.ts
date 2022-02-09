import Axios from 'axios';

const API_ENDPOINT = 'https://getpantry.cloud/apiv1/pantry';

export async function createOrReplaceBasket<T = any>(
  pantryId: string,
  basket: string,
  content: T,
) {
  await Axios.post(`${API_ENDPOINT}/${pantryId}/basket/${basket}`, content);
}

export async function updateBasket<T = any>(
  pantryId: string,
  basket: string,
  content: T,
) {
  await Axios.put(`${API_ENDPOINT}/${pantryId}/basket/${basket}`, content);
}

export async function getBasket<T = any>(
  pantryId: string,
  basket: string,
): Promise<T> {
  let response = await Axios.get(
    `${API_ENDPOINT}/${pantryId}/basket/${basket}`,
  );
  return response.data;
}
