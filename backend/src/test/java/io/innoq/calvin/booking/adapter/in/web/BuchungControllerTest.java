package io.innoq.calvin.booking.adapter.in.web;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/** Verifiziert den REST-Vertrag end-to-end gegen die geseedeten Beispieldaten. */
@SpringBootTest
@AutoConfigureMockMvc
class BuchungControllerTest {

  @Autowired private MockMvc mockMvc;

  @Test
  void buchung_anlegen_liefert_201_und_bestaetigte_buchung() throws Exception {
    String body =
        """
        {"raumId":"koeln-eifel","standortId":"koeln","datum":"2026-09-01",
         "start":"09:00","ende":"10:00","titel":"Sprint Review","gebuchtVon":"Alex Berger"}
        """;
    mockMvc
        .perform(post("/api/buchungen").contentType(MediaType.APPLICATION_JSON).content(body))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").exists())
        .andExpect(jsonPath("$.status", is("bestätigt")))
        .andExpect(jsonPath("$.zeitfenster.start", is("09:00")))
        .andExpect(jsonPath("$.titel", is("Sprint Review")));
  }

  @Test
  void doppelbuchung_liefert_409_mit_alternativer_zeit() throws Exception {
    // koeln-mosel ist am 17.06. von 09:00–13:00 geseedet (Kundenworkshop ACME).
    String body =
        """
        {"raumId":"koeln-mosel","standortId":"koeln","datum":"2026-06-17",
         "start":"10:00","ende":"11:00","titel":"Kollision","gebuchtVon":"Alex Berger"}
        """;
    mockMvc
        .perform(post("/api/buchungen").contentType(MediaType.APPLICATION_JSON).content(body))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.fehler").exists())
        .andExpect(jsonPath("$.naechsteFreieZeit", is("15:00")));
  }

  @Test
  void uebersicht_filtert_nach_nutzer() throws Exception {
    mockMvc
        .perform(get("/api/buchungen").param("nutzer", "Alex Berger"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].gebuchtVon", is("Alex Berger")));
  }

  @Test
  void verfuegbarkeit_meldet_belegten_raum() throws Exception {
    mockMvc
        .perform(
            get("/api/verfuegbarkeit")
                .param("raumId", "koeln-mosel")
                .param("datum", "2026-06-17")
                .param("start", "10:00")
                .param("ende", "11:00"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.verfuegbar", is(false)));
  }
}
