import { api } from './api';
const port = 8080;

api.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
