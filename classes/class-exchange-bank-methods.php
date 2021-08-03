<?php

// 

/**
* Класс содержит методы для работы с курсами валют:
* 
* - загрузка xml с сайта банка
* - преобразование курса валюты в float с заменой запятой на точку
* - округление курса валюты до необходимого кол-ва знаков (по умолчанию 2 знака)
* - добавление курсов валют в БД (добавляются в flymoney_exchange custom type)
* - обновление курсов валют в БД (обновляются в flymoney_exchange custom type)
* 
*/

class ExchangeBankMethods {

    /**
	 * Get xml from url
	 * Получаем xml по url, переданному в аргумент
	 * 
	 * @return	array $xml_daily
	 * @access	protected
	 */
    protected function get_xml_from_bank_url( $xml_url ) {
    	return json_decode( json_encode( simplexml_load_file( $xml_url ) ), TRUE);
    }
    
    /**
	 * Convert valute string to float
	 * Получает курс валюты как строку, конвертирует в float, при этом меняет запятую в курсе валюты на точку 
	 * 
	 * @return	float
	 * @access	public
	 * 
	 */
	public function valute_to_float($value) {
		return floatval( preg_replace("/[^-0-9\.]/", ".", $value) );
	}
	
	/**
	 * Rounds valute float to precision (default=2)
	 * Округляет курс валюты до $precision знаков после запятой (2 по дефолту)
	 * 
	 * @return	float
	 * @access	public
	 * 
	 */
	public function round_valute($value, $precision=2) {
		return round( $value, $precision);
	}
    
    /**
	 * Insert valutes into flymoney_exchange custom type
	 * Добавляет данные курсов валют 
	 * (!!! используется для первоначального наполнения, для обновления служит метод update_valutes)
	 * 
	 * @params	array	(массив курсов валют, полученных из банка)
	 * @access	public
	 * 
	 */
	public function insert_valutes( $valutes ) {
	
		foreach( $valutes as $valute ) {
			
			// 1) задаем аргументы для добавляемого курса валюты
			$args = array(
		        'post_status' => "publish",
				'post_title' => $valute['base_currency'] . '-'. $valute['target_currency'],
		        'post_type' => "flymoney_exchange",
				'post_name' => strtolower($valute['base_currency'] . '-'. $valute['target_currency'])  // slug
		    );
		    
		    // 2) добавляем курс валюты, в $valute_id сохраняется ID добавленной валюты
		    $valute_id = wp_insert_post( wp_slash($args) );
		
		    // 3) обновляем мета боксы добавленного курса валюты
		    update_post_meta( $valute_id, 'flymoney_exchange_meta_country', esc_html($valute['country']));
			update_post_meta( $valute_id, 'flymoney_exchange_meta_base_currency', esc_html($valute['base_currency']));
			update_post_meta( $valute_id, 'flymoney_exchange_meta_base_name', esc_html($valute['base_name']));
			update_post_meta( $valute_id, 'flymoney_exchange_meta_target_currency', esc_html($valute['target_currency']));
			update_post_meta( $valute_id, 'flymoney_exchange_meta_target_name', esc_html($valute['target_name']));
			update_post_meta( $valute_id, 'flymoney_exchange_meta_nominal', esc_html($valute['nominal']));
			update_post_meta( $valute_id, 'flymoney_exchange_meta_exchange_rate', esc_html($valute['exchange_rate']));
			update_post_meta( $valute_id, 'flymoney_exchange_meta_inverse_rate', esc_html($valute['inverse_rate']));
		    update_post_meta( $valute_id, 'flymoney_exchange_meta_updated', wp_date( 'd.m.Y H:i:s' ));
		    
		    // 4) очистка переменных
		    unset($args, $valute_id);
		    
		}
	
	}
	
	/**
	 * Update valutes into flymoney_exchange custom type
	 * Обновляет данные курсов валют 
	 * (обновляются курс и дата обновления, остальные данные вроде как не должны меняться)
	 * 
	 * @params	array	(массив курсов валют, полученных из банка)
	 * @access	public
	 * 
	 */
	public function update_valutes( $valutes ) {
		
		// 1) Получаем все курсы валют из flymoney_exchange
		$posts = get_posts( array(
			'numberposts' => -1,
			'orderby'     => 'date',
			'order'       => 'DESC',
			'post_type'   => 'flymoney_exchange',
			'post_status' => 'publish',
			'suppress_filters' => true,
		) );
		
		foreach( $posts as $post ){
			setup_postdata($post);
			
			$base_currency = explode('-', $post->post_title)[0];
			$target_currency = explode('-', $post->post_title)[1];
		    
		     foreach( $valutes as $valute ) {
				if( $base_currency === $valute['base_currency'] && $target_currency === $valute['target_currency']) {
				    // обновляем курс валюты и дату-время (текущие)
					update_post_meta( $post->ID, 'flymoney_exchange_meta_exchange_rate', esc_html($valute['exchange_rate']));
					update_post_meta( $post->ID, 'flymoney_exchange_meta_inverse_rate', esc_html($valute['inverse_rate']));
		    		update_post_meta( $post->ID, 'flymoney_exchange_meta_updated', wp_date( 'd.m.Y H:i:s' ));
		     	}
		    }

			unset($base_currency, $target_currency);
		}
		
		wp_reset_postdata();
		unset($posts);
	}
	
	
}
