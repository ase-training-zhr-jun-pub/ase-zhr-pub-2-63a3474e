package io.innoq.calvin.booking.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** Minimaler Endpunkt zum Testen der Verbindung zwischen Frontend (SPA) und Booking Service. */
@RestController
public class HelloController {

  @GetMapping("/api/hello")
  public String hello() {
    return "Hello World!";
  }
}
