#include <WiFi.h>
#include <HTTPClient.h>

/*
 * =========================================================
 * IoT-Based Smart Soil Monitoring
 * ESP32 Sensor Node
 *
 * Phase 1:
 * - Connect to Wi-Fi
 * - Generate temporary test sensor readings
 * - Send readings to Node.js backend
 *
 * Later:
 * - Replace simulated values with real RS485 soil sensor
 * - Add air temperature/humidity sensor
 * =========================================================
 */


/*
 * ---------------------------------------------------------
 * Wi-Fi Configuration
 * ---------------------------------------------------------
 *
 * Replace these values with your Wi-Fi details.
 */
const char* WIFI_SSID = "Saran's iphone";
const char* WIFI_PASSWORD = "12345678";


/*
 * ---------------------------------------------------------
 * Backend Configuration
 * ---------------------------------------------------------
 *
 * IMPORTANT:
 * Do NOT use localhost.
 *
 * Replace 192.168.1.105 with your laptop IPv4 address.
 */
const char* API_URL =
  "http://172.20.10.5 :5000/api/v1/readings";


/*
 * ---------------------------------------------------------
 * Device Configuration
 * ---------------------------------------------------------
 */
const char* DEVICE_ID = "AGRO-001";


/*
 * ---------------------------------------------------------
 * Timing
 * ---------------------------------------------------------
 *
 * For testing:
 * Send every 30 seconds.
 *
 * Later:
 * Change to 5 minutes.
 */
const unsigned long SEND_INTERVAL = 30000;

unsigned long lastSendTime = 0;


/*
 * =========================================================
 * Connect Wi-Fi
 * =========================================================
 */
void connectWiFi() {

  Serial.println();
  Serial.println("Connecting to Wi-Fi...");

  WiFi.mode(WIFI_STA);

  WiFi.begin(
    WIFI_SSID,
    WIFI_PASSWORD
  );

  int attempts = 0;

  while (
    WiFi.status() != WL_CONNECTED &&
    attempts < 30
  ) {

    delay(500);

    Serial.print(".");

    attempts++;
  }

  Serial.println();

  if (
    WiFi.status() == WL_CONNECTED
  ) {

    Serial.println(
      "Wi-Fi connected successfully"
    );

    Serial.print(
      "ESP32 IP Address: "
    );

    Serial.println(
      WiFi.localIP()
    );

  } else {

    Serial.println(
      "Failed to connect to Wi-Fi"
    );
  }
}


/*
 * =========================================================
 * Send Sensor Reading
 * =========================================================
 */
void sendSensorReading() {

  /*
   * Reconnect if Wi-Fi connection was lost.
   */
  if (
    WiFi.status() != WL_CONNECTED
  ) {

    Serial.println(
      "Wi-Fi disconnected. Reconnecting..."
    );

    connectWiFi();

    if (
      WiFi.status() != WL_CONNECTED
    ) {

      Serial.println(
        "Cannot send data: Wi-Fi unavailable"
      );

      return;
    }
  }


  /*
   * -------------------------------------------------------
   * TEMPORARY TEST VALUES
   * -------------------------------------------------------
   *
   * These values simulate our future sensors.
   */

  float nitrogen = 42.0;
  float phosphorus = 30.0;
  float potassium = 145.0;

  float soilPH = 6.3;
  float soilEC = 1.4;

  float soilMoisture = 51.0;
  float soilTemperature = 28.2;

  float airTemperature = 31.4;
  float humidity = 72.0;


  /*
   * -------------------------------------------------------
   * Create JSON
   * -------------------------------------------------------
   */

  String jsonPayload = "{";

  jsonPayload +=
    "\"deviceId\":\"" +
    String(DEVICE_ID) +
    "\",";

  jsonPayload +=
    "\"nitrogen\":" +
    String(nitrogen, 2) +
    ",";

  jsonPayload +=
    "\"phosphorus\":" +
    String(phosphorus, 2) +
    ",";

  jsonPayload +=
    "\"potassium\":" +
    String(potassium, 2) +
    ",";

  jsonPayload +=
    "\"ph\":" +
    String(soilPH, 2) +
    ",";

  jsonPayload +=
    "\"ec\":" +
    String(soilEC, 2) +
    ",";

  jsonPayload +=
    "\"soilMoisture\":" +
    String(soilMoisture, 2) +
    ",";

  jsonPayload +=
    "\"soilTemperature\":" +
    String(soilTemperature, 2) +
    ",";

  jsonPayload +=
    "\"airTemperature\":" +
    String(airTemperature, 2) +
    ",";

  jsonPayload +=
    "\"humidity\":" +
    String(humidity, 2);

  jsonPayload += "}";


  Serial.println();
  Serial.println(
    "=================================="
  );

  Serial.println(
    "Sending sensor packet..."
  );

  Serial.println(
    jsonPayload
  );


  /*
   * -------------------------------------------------------
   * HTTP POST
   * -------------------------------------------------------
   */

  HTTPClient http;

  http.begin(API_URL);

  http.addHeader(
    "Content-Type",
    "application/json"
  );


  int httpResponseCode =
    http.POST(
      jsonPayload
    );


  /*
   * -------------------------------------------------------
   * Handle response
   * -------------------------------------------------------
   */

  if (
    httpResponseCode > 0
  ) {

    Serial.print(
      "HTTP Response Code: "
    );

    Serial.println(
      httpResponseCode
    );


    String response =
      http.getString();


    Serial.println(
      "Server Response:"
    );

    Serial.println(
      response
    );

  } else {

    Serial.print(
      "HTTP POST failed: "
    );

    Serial.println(
      http.errorToString(
        httpResponseCode
      )
    );
  }


  http.end();


  Serial.println(
    "=================================="
  );
}


/*
 * =========================================================
 * Setup
 * =========================================================
 */
void setup() {

  Serial.begin(
    115200
  );

  delay(
    1000
  );


  Serial.println();
  Serial.println(
    "=================================="
  );

  Serial.println(
    "AgroSense ESP32 Starting"
  );

  Serial.println(
    "Device ID: AGRO-001"
  );

  Serial.println(
    "=================================="
  );


  connectWiFi();


  /*
   * Send first reading immediately.
   */
  if (
    WiFi.status() == WL_CONNECTED
  ) {

    sendSensorReading();

    lastSendTime =
      millis();
  }
}


/*
 * =========================================================
 * Main Loop
 * =========================================================
 */
void loop() {

  /*
   * Send periodically.
   */
  if (
    millis() -
      lastSendTime >=
    SEND_INTERVAL
  ) {

    lastSendTime =
      millis();

    sendSensorReading();
  }


  /*
   * Prevent busy looping.
   */
  delay(
    100
  );
}