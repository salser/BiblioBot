/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.mycompany.elasticupload;

/**
 *
 * @author jseba_000
 */
public class EventoJaveriana {
    String fecha_inicio;
    String fecha_fin;
    String stamp;
    String UID;
    String fecha_creado;
    String descripcion_larga;
    String fecha_ultima_modificacion;
    String secuencia;
    String transp;
    String resumen;
    String lugar;
    String status;

    public EventoJaveriana() {
    }

    @Override
    public String toString() {
        return "Evento{" + "fecha_inicio=" + fecha_inicio + ", fecha_fin=" + fecha_fin + ", stamp=" + stamp + ", UID=" + UID + ", fecha_creado=" + fecha_creado + ", descripcion_larga=" + descripcion_larga + ", fecha_ultima_modificacion=" + fecha_ultima_modificacion + ", secuencia=" + secuencia + ", transp=" + transp + ", resumen=" + resumen + ", lugar=" + lugar + ", status=" + status + '}';
    }
    
    public String getFecha_inicio() {
        return fecha_inicio;
    }

    public void setFecha_inicio(String fecha_inicio) {
        this.fecha_inicio = fecha_inicio;
    }

    public String getFecha_fin() {
        return fecha_fin;
    }

    public void setFecha_fin(String fecha_fin) {
        this.fecha_fin = fecha_fin;
    }

    public String getStamp() {
        return stamp;
    }

    public void setStamp(String stamp) {
        this.stamp = stamp;
    }

    public String getUID() {
        return UID;
    }

    public void setUID(String UID) {
        this.UID = UID;
    }

    public String getFecha_creado() {
        return fecha_creado;
    }

    public void setFecha_creado(String fecha_creado) {
        this.fecha_creado = fecha_creado;
    }

    public String getDescripcion_larga() {
        return descripcion_larga;
    }

    public void setDescripcion_larga(String descripcion_larga) {
        this.descripcion_larga = descripcion_larga;
    }

    public String getFecha_ultima_modificacion() {
        return fecha_ultima_modificacion;
    }

    public void setFecha_ultima_modificacion(String fecha_ultima_modificacion) {
        this.fecha_ultima_modificacion = fecha_ultima_modificacion;
    }

    public String getSecuencia() {
        return secuencia;
    }

    public void setSecuencia(String secuencia) {
        this.secuencia = secuencia;
    }

    public String getTransp() {
        return transp;
    }

    public void setTransp(String transp) {
        this.transp = transp;
    }

    public String getResumen() {
        return resumen;
    }

    public void setResumen(String resumen) {
        this.resumen = resumen;
    }

    public String getLugar() {
        return lugar;
    }

    public void setLugar(String lugar) {
        this.lugar = lugar;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    
    
    
    
}
