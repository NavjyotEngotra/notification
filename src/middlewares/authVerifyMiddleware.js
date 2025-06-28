import https from "https";

export const verifyTokenFromAuthService = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    const options = {
      hostname: "crm-backend-luhn.onrender.com",
      path: "/api/auth/verify-token",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const requestBody = JSON.stringify({ token });

    const requestPromise = new Promise((resolve, reject) => {
      const reqHttps = https.request(options, (resHttps) => {
        let data = "";

        resHttps.on("data", (chunk) => {
          data += chunk;
        });

        resHttps.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: resHttps.statusCode, body: parsed });
          } catch (err) {
            reject(err);
          }
        });
      });

      reqHttps.on("error", (err) => {
        reject(err);
      });

      reqHttps.write(requestBody);
      reqHttps.end();
    });

    const { status, body } = await requestPromise;

    if (status >= 200 && status < 300 && body?.valid) {
      req.user = {
        id: body.id,
        role: body.role,
        organizationId: body.organizationId || null,
      };
      next();
    } else {
      return res.status(401).json({ message: "Invalid token" });
    }
  } catch (error) {
    console.error("verifyTokenFromAuthService error:", error.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};
