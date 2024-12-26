#include <WiFi.h>
#include <WebServer.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <LiquidCrystal_I2C.h>

// ------ CONFIGURAZIONI E VARIABILI ------

// Configurazione Wi-Fi
const char* ssid = "Chihiro Fushimi";          // Sostituisci con il nome della tua rete Wi-Fi
const char* password = "giuv1911";            // Sostituisci con la password della tua rete Wi-Fi

// Numero totale di posti disponibili
#define POSTI_TOTALI 10
int posti_liberi = POSTI_TOTALI;


String ip_addresses[4] = {"192.168.11.63","192.168.11.154", "192.168.11.173", "192.168.11.101"}; //address IP

// Variabili per il controllo del LED
String ledState = "OFF";
//const int LED_BUILTIN = 2; // Pin del LED integrato sulla ESP32

// Oggetto LCD
LiquidCrystal_I2C lcd(0x27, 16, 2);

// Server HTTP su porta 80
WebServer server(80);

String randNumberReq; //Numero randomico

// ------ FUNZIONI ------

// Inizializza lo schermo LCD
void initLCD() {
  lcd.init();
  lcd.backlight();
  
}

// Aggiorna lo schermo LCD con i posti disponibili
void aggiornaLCD() {
  lcd.clear();
  if (posti_liberi > 0) {
    lcd.setCursor(0, 0);
    lcd.print("Posti liberi:");
    lcd.setCursor(0, 1);
    lcd.print(posti_liberi);
  } else {
    lcd.setCursor(0, 0);
    lcd.print("Posti finiti!");
  }
}

// Route per gestire richieste POST al parcheggio
void handlePost() {
  if (server.hasArg("plain") == false) {
    server.send(400, "application/json", "{\"error\":\"Bad Request\"}");
    return;
  }

  String body = server.arg("plain");
  Serial.println("Richiesta ricevuta: " + body);

  // Parsing del payload JSON
  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, body);

  if (error) {
    Serial.println("Errore nel parsing del JSON");
    server.send(400, "application/json", "{\"error\":\"Invalid JSON\"}");
    return;
  }

  int x = doc["x"]; // x=1 per ingresso, x=0 per uscita
  StaticJsonDocument<100> response;
  int ack = 0;

  if (x == 1) { // Ingresso
    if (posti_liberi > 0) {
      posti_liberi--;
      ack = 1;
      Serial.println("Ingresso consentito. Posti liberi: " + String(posti_liberi));
    } else {
      Serial.println("Posti esauriti. Ingresso negato.");
    }
  } else if (x == 0) { // Uscita
    if (posti_liberi < POSTI_TOTALI) {
      posti_liberi++;
      ack = 1;
      Serial.println("Uscita consentita. Posti liberi: " + String(posti_liberi));
    } else {
      Serial.println("Nessuna macchina in uscita. Uscita negata.");
    }
  }

  aggiornaLCD();

  response["ack"] = ack;
  String responseBody;
  serializeJson(response, responseBody);
  server.send(200, "application/json", responseBody);
}


void handlePlaces(){
  server.send(200, "text", String(posti_liberi));

}

void handleChangePlaces(){
  //mi prendo il nuovo numero di posti dal payload della risposta
  String body = server.arg("plain");
  Serial.println("Richiesta ricevuta: " + body);

  // Creare un buffer per analizzare il JSON 
  const size_t capacity = JSON_OBJECT_SIZE(1) + 20; 
  DynamicJsonDocument doc(capacity); //Crea un DynamicJsonDocument con la capacità del Buffer creato
  
  // Analizzare il JSON 
  DeserializationError error = deserializeJson(doc, body);  //Deserializza il json

  if (error) { 
    Serial.print(F("Errore di deserializzazione JSON: ")); 
    Serial.println(error.f_str()); server.send(400, "application/json", "{\"error\":\"Invalid JSON\"}"); 
    return; 
  } 
    
  // Ottieni il valore del campo "posti" 
  int num_posti = doc["posti"]; 
  posti_liberi = num_posti;
  aggiornaLCD();
  
  server.send(201,"","");
}

void handleOptions(){ 
  server.sendHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS"); 
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type"); 
  server.send(204); // No Content 
}

void getKeys(){

  randNumberReq = String(random(30, 10001));
  server.send(200, "text/plain", randNumberReq);
}


void sendGetGates(int id){
    HTTPClient http;
    http.begin("http://"+ip_addresses[id-1]+"/gate");
    int HttpResponseCode = http.GET();
    delay(500);
    
    if(HttpResponseCode == 200){
      server.send(200, "", "");
    } else {
      server.send(500, "", "");
    }
    
    randNumberReq="";
    http.end();
}


void handleGates(){

  //mi prendo il nuovo numero di posti dal payload della risposta
  String body = server.arg("plain");
  Serial.println("Richiesta ricevuta: " + body);

  // Creare un buffer per analizzare il JSON 
  const size_t capacity = JSON_OBJECT_SIZE(2) + 40; 
  DynamicJsonDocument doc(capacity); //Crea un DynamicJsonDocument con la capacità del Buffer creato
  
  // Analizzare il JSON 
  DeserializationError error = deserializeJson(doc, body);  //Deserializza il json

  if (error) { 
    Serial.print(F("Errore di deserializzazione JSON: ")); 
    Serial.println(error.f_str()); server.send(400, "application/json", "{\"error\":\"Invalid JSON\"}"); 
    return; 
  } 

  int id = doc["id"];
  String random = doc["random"];

  
  Serial.println(random);
  Serial.println(randNumberReq);
  Serial.println(id);

  if (random.compareTo(randNumberReq) == 0) {
      Serial.print("Richiesta di apertura...");
      sendGetGates(id);
  }

}


// Configura le route del server
void setupServerRoutes() {
  server.enableCORS();
  server.on("/2002200001280929", HTTP_GET, getKeys); //Ritorna il valore casuale
  server.on("/gates", HTTP_POST, handleGates);
  server.on("/places", HTTP_GET, handlePlaces);  //Ritorna i posti disponibili
  server.on("/parking", HTTP_POST, handlePost);  // Gestisce ingressi/uscite parcheggio
  server.on("/change_places", HTTP_POST,handleChangePlaces); //Aggiornamento posti da parte dell'admin
  server.on("/change_places", HTTP_OPTIONS, handleOptions); //Per le richieste di Pre-Flight
  server.begin();
  Serial.println("Server HTTP avviato");
}

// ------ SETUP E LOOP ------

void setup() {
  Serial.begin(115200);
  initLCD();

  lcd.setCursor(0, 0);
  lcd.print("DI.P.S by B&B");
  delay(1000);


  // Configurazione Wi-Fi
  WiFi.begin(ssid, password);
  Serial.println("Connessione alla rete Wi-Fi...");
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Connessione...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\nConnesso al Wi-Fi!");
  Serial.print("Indirizzo IP: ");
  Serial.println(WiFi.localIP());

  
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Posti liberi:");
  lcd.setCursor(0, 1);
  lcd.print(posti_liberi);

  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW);

  // Configura le route del server
  setupServerRoutes();
  randomSeed(analogRead(0)); //Seed per il numero randomico, generato nel metodo "get2002200001280929"
}

void loop() {
  server.handleClient();
}