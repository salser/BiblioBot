/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.mycompany.elasticupload;

import java.io.FileInputStream;
import java.io.IOException;
import net.fortuna.ical4j.data.CalendarBuilder;
import net.fortuna.ical4j.model.*;
import net.fortuna.ical4j.model.component.*;
import net.fortuna.ical4j.model.property.*;
import java.io.FileInputStream;
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
        String fecha = "20190509T170000Z";
        java.util.Date date = new SimpleDateFormat("yyyyMMdd'T'HHmmss'Z'").parse(fecha);
        System.out.println(date);
                
        String isoDatePattern = "yyyy-MM-dd HH:mm:ss";
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat(isoDatePattern);
        String dateString = simpleDateFormat.format(date);
        System.out.println(dateString);
        
        IndexRequest request = new IndexRequest("test");
        request.id("565");
        String Json = "{" +
        "\"user\":\"kimchy\"," +
        "\"postDate\":\"2013-01-30\"," +
        "\"message\":\"trying out Elasticsearch\"" +
        "}";
        
        request.source(Json, XContentType.JSON);
        
        IndexResponse indexResponse = client.index(request, RequestOptions.DEFAULT);       
        client.close();
        */
        
        // leer archivo .ics --------------------------------------------------
        ArrayList<Map>calendarentries = new ArrayList<Map>();
        Map<String, String> calendarEntry = null;
        Scanner keyboard = new Scanner(System.in);
        System.out.println("ingrese ruta de archivo");
        String ruta = keyboard.nextLine();
        FileInputStream file=new FileInputStream(ruta);
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
        //Crear Index
        IndexRequest indexRequest = new IndexRequest("calendarioprueba5");
        //pasar cada evento a un objeto Evento y subirlo       
        List<Evento> eventos = new ArrayList<>();
        String Pattern = "yyyy-MM-dd HH-mm-ss";
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat(Pattern);
        int iddoc = 1;
        for (Map m: calendarentries){ //por cada evento
             
            //SimpleDateFormat simpleDateFormat;
            Map<String, String> jsonMap = new HashMap<>();
            Evento e = new Evento();
            e.UID=          (String) m.get("UID");
            e.descripcion_larga=  (String) m.get("DESCRIPTION");
            e.resumen=      (String) m.get("SUMMARY");
            e.secuencia=    (String) m.get("SEQUENCE");
            e.lugar=        (String) m.get("LOCATION");
            e.status=       (String) m.get("STATUS");
            e.transp=       (String) m.get("TRANSP");
            
            java.util.Date date5 = new SimpleDateFormat("yyyyMMdd'T'HHmmss'Z'").parse((String) m.get("CREATED"));
            e.fecha_creado=       simpleDateFormat.format(date5);
            
            java.util.Date date1 = new SimpleDateFormat("yyyyMMdd'T'HHmmss'Z'").parse((String) m.get("DTEND"));
            e.fecha_fin=          simpleDateFormat.format(date1);
            
            java.util.Date date2 = new SimpleDateFormat("yyyyMMdd'T'HHmmss'Z'").parse((String) m.get("DTSTART"));
            e.fecha_inicio=       simpleDateFormat.format(date2);
            
            
            java.util.Date date3 = new SimpleDateFormat("yyyyMMdd'T'HHmmss'Z'").parse((String) m.get("LAST-MODIFIED"));
            e.fecha_ultima_modificacion=   simpleDateFormat.format(date3);
            
            
            java.util.Date date4 = new SimpleDateFormat("yyyyMMdd'T'HHmmss'Z'").parse((String) m.get("DTSTAMP"));
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
}
        
        
