import { apiClient } from './client'

/**
 * TASK: use `apiClient` to fetch list of diary content
 *
 * @example
 * `GET /cms/diary?id=359007&id=358317&id=343275&status=posted`
 * 
 * Note that:
 * - `status` param must exist and have value of `'posted'`
 */
export async function getDiaryFeed() {
  const ids = [
    359007,
    358317,
    343275,
    342861,
    342723,
    342240,
    341343,
    296907,
    253782,
    177123,
  ]
  ...
}

/**
 * TASK: use `apiClient` to fetch diary content by id
 *
 * @example
 * `GET /cms/diary?id=359007&status=posted`
 * 
 * Note that:
 * - `status` param must exist and have value of `'posted'`
 */
export async function getDiaryContentById(id) {
  ...
}
