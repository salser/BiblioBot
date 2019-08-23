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
        
        
