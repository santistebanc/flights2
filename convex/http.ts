import { auth } from "./auth";
import router from "./router";
import { addEntities } from "./webhooks";

const http = router;

auth.addHttpRoutes(http);

http.route({
  method: "POST",
  path: "/webhooks/addEntities",
  handler: addEntities,
});

export default http;
