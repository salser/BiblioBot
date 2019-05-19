/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.mycompany.elasticupload;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import com.hazelcast.core.HazelcastInstance;
import java.io.FileInputStream;
import java.io.IOException;
import net.fortuna.ical4j.data.CalendarBuilder;
import net.fortuna.ical4j.model.*;
import net.fortuna.ical4j.model.component.*;
import net.fortuna.ical4j.model.property.*;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.net.URL;
import static java.sql.DriverManager.println;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Scanner;
import net.fortuna.ical4j.data.ParserException;
import org.apache.http.HttpHost;
import org.elasticsearch.action.DocWriteResponse;
import org.elasticsearch.action.bulk.BulkRequest;
import org.elasticsearch.action.index.IndexRequest;
import org.elasticsearch.action.index.IndexResponse;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.common.xcontent.XContentType;

/**
 *
 * @author Blaze
 */
public class Main {

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) throws IOException, ParserException, ParseException {
        //Crear cliente rest---------------------------------------------------
        RestHighLevelClient client = new RestHighLevelClient(
        RestClient.builder(
                new HttpHost("localhost", 9200, "http"),
                new HttpHost("localhost", 9201, "http")));
        /*
        int d = 1;
        for (int i=4;i<24;i++){
                System.out.println(String.format("%02d", i));
                String url = "https://www.biblored.gov.co/api-agenda/eventos-agenda/"+String.format("%02d", i)+"/45/2019"+String.format("%02d", d);
                System.out.println(url);
                d++;
        }
        */
        // leer archivo eventos biblored json ----------------------------------------------------
        System.out.println("indexando eventos biblored");
        try{
            IndexRequest indexRequest = new IndexRequest("calendariobiblored");
            int idoc =0;
            for(int i =4;i<24;i++){
            boolean next=true;
            int d = 1;
            do{
            String url = "https://www.biblored.gov.co/api-agenda/eventos-agenda/"+String.format("%02d", i)+"/45/2019"+String.format("%02d", d);
            System.out.println("leyendo json: "+url);
            Reader reader = new InputStreamReader(new URL(url).openStream()); //Read the json output
            Gson gson = new GsonBuilder().create();
            EventoBiblored[] objs = gson.fromJson(reader, EventoBiblored[].class);
            if (objs.length != 0){
            d++;
            String Pattern24 = "HH-mm-ss";
            SimpleDateFormat dateFormat24 = new SimpleDateFormat(Pattern24);
            for (EventoBiblored ev : objs){
                Map<String, String> calendarbiblored = new HashMap<>();
                calendarbiblored.put("titulo", ev.titulo);
                calendarbiblored.put("descripcion_corta", ev.descripcion_corta);
                calendarbiblored.put("descripcion_larga", ev.descripcion_larga);
                calendarbiblored.put("fecha_evento", ev.fecha_evento);
                System.out.println(ev.fecha_evento);
                SimpleDateFormat date12Format = new SimpleDateFormat("hh:mm a");
                ev.field_hora_ini = dateFormat24.format(date12Format.parse(ev.field_hora_ini));
                System.out.println(ev.field_hora_ini);
                calendarbiblored.put("hora_inicio", ev.field_hora_ini);
                calendarbiblored.put("field_publico", ev.field_publico);
                calendarbiblored.put("tipo_actividad", ev.field_tipo_de_actividad);
                calendarbiblored.put("nid", ev.nid);
                calendarbiblored.put("nombre_biblioteca", ev.nombre_biblioteca);
                calendarbiblored.put("linea_misional", ev.nombre_linea_misional);
                calendarbiblored.put("tid_biblioteca", ev.tid_biblioteca);
                calendarbiblored.put("tid_linea_misional", ev.tid_linea_misional);
                indexRequest.id(String.valueOf(idoc));
                indexRequest.source(calendarbiblored);
                IndexResponse indexResponse = client.index(indexRequest, RequestOptions.DEFAULT); // se hace la solicitud  de indexar a elasticsearch
                idoc++; //se aumenta contador para asignar a otros documentos
                
                if (indexResponse.getResult() == DocWriteResponse.Result.CREATED)
                    System.out.println("Documento agregado");
                else
                    System.out.println("Documento no creado o reescrito");
            } //final for
            } //final if
            else{
            next = false;
                System.out.println("VACIO, siguiente biblioteca...");
            }
            reader.close();
        } while (next);
        }
            System.out.println("todas las bibliotecas procesadas");
        }
        catch(Exception e){
            System.out.println(e);
        }
        
        // leer archivo eventos javeriana .ics --------------------------------------------------
        try{
        System.out.println("indexando eventos javeriana");
        ArrayList<Map>calendarentries = new ArrayList<>();
        Map<String, String> calendarEntry = null;
        InputStream file=new URL("https://calendar.google.com/calendar/ical/comunicacionesbibliotecapuj@gmail.com/public/basic.ics").openStream();
        CalendarBuilder  builder = new CalendarBuilder();
        Calendar calendar = builder.build(file);
        System.out.println("DOCUMENTO:");
        System.out.println(calendar.getProductId());
        ComponentList cs  = calendar.getComponents();
        //tomar cada evento y ponerlo en un Hashmap ---------------------------
        for (Iterator i = calendar.getComponents().iterator(); i.hasNext(); ) {
            Component component = (Component) i.next();
            if (component.getName().equalsIgnoreCase("VEVENT")) {
                calendarEntry = new HashMap<>();
                for (Iterator j = component.getProperties().iterator(); j.hasNext(); ) {
                    net.fortuna.ical4j.model.Property property = (Property) j.next();
                    calendarEntry.put(property.getName(), property.getValue());
                    //System.out.println(property.getValue());
                }
            calendarentries.add(calendarEntry);
            }
        }
        
        file.close();
        //Crear Index
        IndexRequest indexRequest = new IndexRequest("calendarioprueba5");
        //pasar cada evento a un objeto Evento y subirlo       
        List<EventoJaveriana> eventos = new ArrayList<>();
        String Pattern = "yyyy-MM-dd HH-mm-ss";
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat(Pattern);
        int iddoc = 1;
        for (Map m: calendarentries){ //por cada evento
             
            //SimpleDateFormat simpleDateFormat;
            Map<String, String> jsonMap = new HashMap<>();
            EventoJaveriana e = new EventoJaveriana();
            e.UID=          (String) m.get("UID");
            e.descripcion_larga=  (String) m.get("DESCRIPTION");
            e.resumen=      (String) m.get("SUMMARY");
            e.secuencia=    (String) m.get("SEQUENCE");
            e.lugar=        (String) m.get("LOCATION");
            e.status=       (String) m.get("STATUS");
            e.transp=       (String) m.get("TRANSP");
            
            //java.util.Date date5 = new SimpleDateFormat("yyyyMMdd'T'HHmmss'Z'").parse((String) m.get("CREATED"));
            java.util.Date date5 = new SimpleDateFormat(generarPatron((String) m.get("CREATED"))).parse((String) m.get("CREATED"));
            e.fecha_creado=       simpleDateFormat.format(date5);
            
            String check =(String)m.get("DTEND");
            if (check != null &&!check.isEmpty()){
            java.util.Date date1 = new SimpleDateFormat(generarPatron((String) m.get("DTEND"))).parse((String) m.get("DTEND"));
            e.fecha_fin=          simpleDateFormat.format(date1);
            }
            
            java.util.Date date2 = new SimpleDateFormat(generarPatron((String) m.get("DTSTART"))).parse((String) m.get("DTSTART"));
            e.fecha_inicio=       simpleDateFormat.format(date2);
            
            
            java.util.Date date3 = new SimpleDateFormat(generarPatron((String) m.get("LAST-MODIFIED"))).parse((String) m.get("LAST-MODIFIED"));
            e.fecha_ultima_modificacion=   simpleDateFormat.format(date3);
            
            
            java.util.Date date4 = new SimpleDateFormat(generarPatron((String) m.get("DTSTAMP"))).parse((String) m.get("DTSTAMP"));
            e.stamp=        simpleDateFormat.format(date4);
            
            eventos.add(e);
            System.out.println("EVENTO:");
            System.out.println(e.toString());
            jsonMap.put("inicio", e.fecha_inicio);
            jsonMap.put("fin", e.fecha_fin);
            jsonMap.put("UID", e.UID);
            jsonMap.put("descripcion", e.descripcion_larga);
            jsonMap.put("resumen", e.resumen);
            jsonMap.put("lugar", e.lugar);
            jsonMap.put("status", e.status);
            
            //Proceso de indexar
            indexRequest.id(String.valueOf(iddoc)); //se asigna ID al doc
            indexRequest.source(jsonMap); //se agregan los campos y el valor de cada uno usando Map
            IndexResponse indexResponse = client.index(indexRequest, RequestOptions.DEFAULT); // se hace la solicitud  de indexar a elasticsearch
            iddoc++; //se aumenta contador para asignar a otros documentos
            
            //saber resultado de intento----------------------------------------
            String index = indexResponse.getIndex();
            String id = indexResponse.getId();
            if (indexResponse.getResult() == DocWriteResponse.Result.CREATED)
                System.out.println("Documento agregado");
            else
                System.out.println("Documento no creado o reescrito");
        }
        client.close();
        
        }
        catch(Exception e){
            System.out.println(e);
        }

        System.exit(0);
    }    

    private static String generarPatron(String string) {
        if (string.contains("T"))
            if (string.contains("Z"))
                return "yyyyMMdd'T'HHmmss'Z'";
            else
                return "yyyyMMdd'T'HHmmss";
        else
            return "yyyyMMdd";
        }
}
        
        
