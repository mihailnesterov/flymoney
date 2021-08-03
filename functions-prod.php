<?php
// Exit if accessed directly
if ( !defined( 'ABSPATH' ) ) exit;


// Mihail

/**
 * custom type creater
 * 
* Большая функция на хук init, в которой создаем курсы валют, метабоксы, внешний вид таблицы курсов валют.
* Подключаются классы из каталога classes и файл include/countries.php, из которого берем массив стран, с которыми работает обмен
*/
add_action( 'init', 'register_custom_post_type' );
function register_custom_post_type() {

	// Подключаем класс для создания custom type для хранения курсов валют
	require_once get_stylesheet_directory() . '/classes/class-exchange-custom-type.php';
	
	// Регистрируем custom type
	$custom_type = new ExchangeCustomType();
	
	// Подключаем класс для создания метабоксов для курсов валют
	require_once get_stylesheet_directory() . '/classes/class-exchange-meta-box.php';
	
	// Задаем набор опций, в которых перечисляем настройки метабоксов для курсов валют
	$options = array(
		array(
			'id'	=>	'flymoney_exchange_meta',
			'name'	=>	'Курс валюты с сайта http://www.floatrates.com/',
			'post'	=>	array('flymoney_exchange'),
			'pos'	=>	'normal',
			'pri'	=>	'high',
			'cap'	=>	'edit_posts',
			'args'	=>	array(
				array(
					'id'			=>	'country',
					'title'			=>	'Страна',
					'type'			=>	'select',
					'desc'			=>	'Страна валюты',
					'cap'			=>	'edit_posts',
					'args'			=>	array_values(require get_stylesheet_directory() . '/include/countries.php') // страны берем из файла
				),
				array(
					'id'			=>	'base_currency',
					'title'			=>	'Валюта (base)',
					'type'			=>	'text',
					'placeholder'	=>	'Введите валюту',
					'desc'			=>	'Валюта (RUB, TRY...)',
					'cap'			=>	'edit_posts'
				),
				array(
					'id'			=>	'base_name',
					'title'			=>	'Название валюты (base)',
					'type'			=>	'text',
					'placeholder'	=>	'Введите название валюты',
					'desc'			=>	'Название валюты (eng)',
					'cap'			=>	'edit_posts'
				),
				array(
					'id'			=>	'target_currency',
					'title'			=>	'Валюта (target)',
					'type'			=>	'text',
					'placeholder'	=>	'Введите валюту',
					'desc'			=>	'Валюта (RUB, TRY...)',
					'cap'			=>	'edit_posts'
				),
				array(
					'id'			=>	'target_name',
					'title'			=>	'Название валюты (target)',
					'type'			=>	'text',
					'placeholder'	=>	'Введите название валюты',
					'desc'			=>	'Название валюты (eng)',
					'cap'			=>	'edit_posts'
				),
				array(
					'id'			=>	'nominal',
					'title'			=>	'Номинал',
					'type'			=>	'text',
					'placeholder'	=>	'Введите номинал валюты',
					'desc'			=>	'Номинал валюты (по умолчанию 1)',
					'cap'			=>	'edit_posts'
				),
				array(
					'id'			=>	'exchange_rate',
					'title'			=>	'Курс',
					'type'			=>	'text',
					'placeholder'	=>	'Введите курс валюты',
					'desc'			=>	'Курс валюты',
					'cap'			=>	'edit_posts'
				),
				array(
					'id'			=>	'inverse_rate',
					'title'			=>	'Курс (inverse)',
					'type'			=>	'text',
					'placeholder'	=>	'Введите курс валюты (inverse)',
					'desc'			=>	'Курс валюты (inverse)',
					'cap'			=>	'edit_posts'
				),
				array(
					'id'			=>	'updated',
					'title'			=>	'Дата обновления',
					'type'			=>	'text',
					'placeholder'	=>	'Дата обновления (устанавливается автоматически)',
					'desc'			=>	'Дата последнего обновления',
					'cap'			=>	'edit_posts'
				)
			)
		)
	);
	
	// В цикле создаем метабоксы
	foreach ($options as $option) {
		$metabox = new ExchangeMetaBox($option);
	}
	
	// Удаляем "мусор"
	unset($custom_type, $options, $metabox);
	
	//Задаем набор колонок и контент в таблице курсов валют - какие колонки отображать и как их озаглавить
	
	// Колонки
	add_filter( 'manage_edit-flymoney_exchange_columns' , 'add_flymoney_exchange_custom_columns', 10, 2 );
	function add_flymoney_exchange_custom_columns( $columns ) {
		$columns = array(
			'cb' => '&lt;input type="checkbox" />',
			'title' => __( 'Валюта', 'textdomain' ),
			'country' => __( 'Страна', 'textdomain' ),
			'base_currency' => __( 'Валюта (base)', 'textdomain' ),
			'base_name' => __( 'Название (base)', 'textdomain' ),
			'target_currency' => __( 'Валюта (target)', 'textdomain' ),
			'target_name' => __( 'Название (target)', 'textdomain' ),
			'nominal' => __( 'Номинал', 'textdomain' ),
			'exchange_rate' => __( 'Курс', 'textdomain' ),
			'inverse_rate' => __( 'Курс (inverse)', 'textdomain' ),
			'updated' => __( 'Дата обновления', 'textdomain' )
		);
	
		return $columns;
	}
	// Контент
	add_action( 'manage_flymoney_exchange_posts_custom_column', 'add_flymoney_exchange_custom_columns_content', 10, 2 );
	function add_flymoney_exchange_custom_columns_content( $column, $post_id ) {
		global $post;
		// как отображать контент в ячейках таблицы, данные берутся из метабоксов, или из статических файлов (например, страны из include/countries.php)
		switch( $column ) {
			case 'country' :
				$country = get_post_meta( $post_id, 'flymoney_exchange_meta_country', true );
				// загружаем массив стран из файла include/countries.php
				$countries = array_values(require get_stylesheet_directory() . '/include/countries.php');

				if ( empty( $country ) ) echo __( $countries[0], 'textdomain' );
				else
					printf( __( '%s' ), $countries[$country] );
				break;
			case 'base_currency' :
				$base_currency = get_post_meta( $post_id, 'flymoney_exchange_meta_base_currency', true );
				if ( empty( $base_currency ) ) echo __( '-', 'textdomain' );
				else
					printf( __( '%s' ), $base_currency );
				break;
			case 'base_name' :
				$base_name = get_post_meta( $post_id, 'flymoney_exchange_meta_base_name', true );
				if ( empty( $base_name ) ) echo __( '-', 'textdomain' );
				else
					printf( __( '%s' ), $base_name );
				break;
			case 'target_currency' :
				$target_currency = get_post_meta( $post_id, 'flymoney_exchange_meta_target_currency', true );
				if ( empty( $target_currency ) ) echo __( '-', 'textdomain' );
				else
					printf( __( '%s' ), $target_currency );
				break;
			case 'target_name' :
				$target_name = get_post_meta( $post_id, 'flymoney_exchange_meta_target_name', true );
				if ( empty( $target_name ) ) echo __( '-', 'textdomain' );
				else
					printf( __( '%s' ), $target_name );
				break;
			case 'nominal' :
				$nominal = get_post_meta( $post_id, 'flymoney_exchange_meta_nominal', true );
				if ( empty( $nominal ) ) echo __( '-', 'textdomain' );
				else
					printf( __( '%s' ), $nominal );
				break;
			case 'exchange_rate' :
				$exchange_rate = get_post_meta( $post_id, 'flymoney_exchange_meta_exchange_rate', true );
				if ( empty( $exchange_rate ) ) echo __( '-', 'textdomain' );
				else
					printf( __( '%s' ), $exchange_rate );
				break;
			case 'inverse_rate' :
				$inverse_rate = get_post_meta( $post_id, 'flymoney_exchange_meta_inverse_rate', true );
				if ( empty( $inverse_rate ) ) echo __( '-', 'textdomain' );
				else
					printf( __( '%s' ), $inverse_rate );
				break;
			case 'updated' :
				$updated = get_post_meta( $post_id, 'flymoney_exchange_meta_updated', true );
				if ( empty( $updated ) ) echo __( '-', 'textdomain' );
				else
					printf( __( '%s' ), $updated );
				break;
			default :
				break;
		}
	}
	
	// Делаем столбцы сортируемыми
	add_filter( 'manage_edit-flymoney_exchange_sortable_columns', 'make_flymoney_exchange_custom_columns_sortable' );
	function make_flymoney_exchange_custom_columns_sortable( $columns ) {
		// перечисляем все столбцы, по которым можно сортировать, title не перечислен, т.к. по нему сортировка уже есть по умолчанию
		// !!! не факт, что сортироваться будут как надо, так как имеет значение тип данных, везде string, поэтому сортирует как string, тут уж как есть...
		$columns['country'] = 'country';
		$columns['base_currency'] = 'base_currency';
		$columns['base_name'] = 'base_name';
		$columns['target_currency'] = 'target_currency';
		$columns['target_name'] = 'target_name';
		$columns['nominal'] = 'nominal';
		$columns['exchange_rate'] = 'exchange_rate';
		$columns['inverse_rate'] = 'inverse_rate';
		$columns['updated'] = 'updated';
		
		return $columns;
	}
}
// end register custom post type

/**
* Функция на хук init, в которой создаем статусы клиентов, метабоксы, внешний вид таблицы статусов.
*/
add_action( 'init', 'register_client_status_custom_post_type' );
function register_client_status_custom_post_type() {

	// Подключаем класс для создания custom type для хранения курсов валют
	require_once get_stylesheet_directory() . '/classes/class-client-status-custom-type.php';
	
	// Регистрируем custom type
	$custom_type = new ClientStatusCustomType();
	
	// Подключаем класс для создания метабоксов для статусов клиентов
	require_once get_stylesheet_directory() . '/classes/class-client-status-meta-box.php';
	
	// Задаем набор опций, в которых перечисляем настройки метабоксов для статусов клиентов
	$options = array(
		array(
			'id'	=>	'flymoney_status_meta',
			'name'	=>	'Статусы клиентов',
			'post'	=>	array('flymoney_status'),
			'pos'	=>	'normal',
			'pri'	=>	'high',
			'cap'	=>	'edit_posts',
			'args'	=>	array(
				array(
					'id'			=>	'quantity',
					'title'			=>	'Количество заказов',
					'type'			=>	'number',
					'placeholder'	=>	'Введите количество',
					'desc'			=>	'Количество заказов, необходимое для достижения статуса',
					'cap'			=>	'edit_posts'
				),
				array(
					'id'			=>	'discount',
					'title'			=>	'Скидка %',
					'type'			=>	'number',
					'placeholder'	=>	'Введите % скидки',
					'desc'			=>	'Скидка (% от tax), которую получает клиент',
					'cap'			=>	'edit_posts'
				),
				array(
					'id'			=>	'color',
					'title'			=>	'Цвет статуса',
					'type'			=>	'text',
					'placeholder'	=>	'Введите цвет',
					'desc'			=>	'Цвет статуса, в формате #FFF000',
					'cap'			=>	'edit_posts'
				),
				array(
					'id'			=>	'description',
					'title'			=>	'Описание статуса',
					'type'			=>	'textarea',
					'placeholder'	=>	'Введите описание',
					'desc'			=>	'Дополнительная информация о статусе',
					'cap'			=>	'edit_posts'
				)
			)
		)
	);
	
	// В цикле создаем метабоксы
	foreach ($options as $option) {
		$metabox = new ClientStatusMetaBox($option);
	}
	
	// Удаляем "мусор"
	unset($custom_type, $options, $metabox);
	
	//Задаем набор колонок и контент в таблице статусов - какие колонки отображать и как их озаглавить
	
	// Колонки
	add_filter( 'manage_edit-flymoney_status_columns' , 'add_flymoney_status_custom_columns', 10, 2 );
	function add_flymoney_status_custom_columns( $columns ) {
		$columns = array(
			'cb' => '&lt;input type="checkbox" />',
			'title' => __( 'Статус', 'textdomain' ),
			'quantity' => __( 'Количество заказов', 'textdomain' ),
			'discount' => __( 'Скидка (%)', 'textdomain' ),
			'color' => __( 'Цвет', 'textdomain' ),
			'description' => __( 'Описание', 'textdomain' )
		);
	
		return $columns;
	}
	// Контент
	add_action( 'manage_flymoney_status_posts_custom_column', 'add_flymoney_status_custom_columns_content', 10, 2 );
	function add_flymoney_status_custom_columns_content( $column, $post_id ) {
		global $post;
		// как отображать контент в ячейках таблицы, данные берутся из метабоксов, или из статических файлов (например, страны из include/countries.php)
		switch( $column ) {
			case 'quantity' :
				$quantity = get_post_meta( $post_id, 'flymoney_status_meta_quantity', true );
				if ( empty( $quantity ) ) echo __( '-', 'textdomain' );
				else
					printf( __( '%s' ), $quantity );
				break;
			case 'discount' :
				$discount = get_post_meta( $post_id, 'flymoney_status_meta_discount', true );
				if ( empty( $discount ) ) echo __( '-', 'textdomain' );
				else
					printf( __( '%s' ), $discount );
				break;
			case 'color' :
				$color = get_post_meta( $post_id, 'flymoney_status_meta_color', true );
				if ( empty( $color ) ) echo __( '-', 'textdomain' );
				else
					printf( __( '<span style="background-color:'.$color.';padding:5px 8px">%s</span>' ), $color );
				break;
			case 'description' :
				$description = get_post_meta( $post_id, 'flymoney_status_meta_description', true );
				if ( empty( $description ) ) echo __( '-', 'textdomain' );
				else
					printf( __( '%s' ), $description );
				break;
			default :
				break;
		}
	}
	
	// Делаем столбцы сортируемыми
	add_filter( 'manage_edit-flymoney_status_sortable_columns', 'make_flymoney_status_custom_columns_sortable' );
	function make_flymoney_status_custom_columns_sortable( $columns ) {
		$columns['quantity'] = 'quantity';
		$columns['discount'] = 'discount';
		$columns['description'] = 'description';
		
		return $columns;
	}
}
// end register client status custom post type

// функция для получения всех доступных статусов
function get_available_users_statuses() {

	$available_statuses = array();
	
	$statuses = get_posts( array(
		'numberposts' => -1,
		'orderby'     => 'date',
		'order'       => 'DESC',
		'post_type'   => 'flymoney_status',
		'suppress_filters' => true,
	) );

	foreach( $statuses as $key => $status ) {
		setup_postdata($status);

		$quantity = intval(get_post_meta( $status->ID, 'flymoney_status_meta_quantity', true ));
		$discount = floatval(get_post_meta( $status->ID, 'flymoney_status_meta_discount', true ));
		$color = get_post_meta( $status->ID, 'flymoney_status_meta_color', true );
		$description = get_post_meta( $status->ID, 'flymoney_status_meta_description', true );
		
		array_push(
			$available_statuses, 
			array(
				'ID' => $status->ID,
				'status' => $status->post_title,
				'quantity' => $quantity,
				'discount' => $discount,
				'color' => $color,
				'description' => $description,
			)
		);		
	}
	wp_reset_postdata();

	return $available_statuses;
}

// функция для получения статуса пользователя
function get_user_status() {
	if ( get_current_user_id() !== 0 ) {
		
		$user_id = get_current_user_id();
		$customer = new WC_Customer( $user->ID );
		$available_statuses = get_available_users_statuses();

		$user_status = array_values(array_filter(
			$available_statuses,
			function( $item ) use( $user_id ) {
				return $item['ID'] === intval(get_user_meta ( $user_id, 'client_status', true));
			}
		));

		return ( isset($user_status) && !empty($user_status) ? $user_status[0] : 0);
	}

	return 0;
	
}

// функция для получения количества выполненных заказов пользователя
function get_customer_completed_order_count($value = 0) {
    
    if ( ! is_user_logged_in() && $value === 0 ) {
        return 0;
    }

    global $wpdb;
    
    // Based on user ID (registered users)
    if ( is_numeric( $value) ) { 
        $meta_key   = '_customer_user';
        $meta_value = $value == 0 ? (int) get_current_user_id() : (int) $value;
    } 
    // Based on billing email (Guest users)
    else { 
        $meta_key   = '_billing_email';
        $meta_value = sanitize_email( $value );
    }
    
    $paid_order_statuses = array_map( 'esc_sql', wc_get_is_paid_statuses() );

    $count = $wpdb->get_var( $wpdb->prepare("
        SELECT COUNT(p.ID) FROM {$wpdb->prefix}posts AS p
        INNER JOIN {$wpdb->prefix}postmeta AS pm ON p.ID = pm.post_id
        WHERE p.post_status IN ( 'wc-completed' )
        AND p.post_type LIKE 'shop_order'
        AND pm.meta_key = '%s'
        AND pm.meta_value = %s
    ", $meta_key, $meta_value ) );

	return $count;
}

// Добавляем поле статус в профиль пользователя
add_action( 'show_user_profile', 'status_user_profile_field' );
add_action( 'edit_user_profile', 'status_user_profile_field' );
function status_user_profile_field( $user ) { 

	$user_orders_count = get_customer_completed_order_count( $user->ID );

	$statuses = get_posts( array(
		'numberposts' => -1,
		'orderby'     => 'date',
		'order'       => 'DESC',
		'post_type'   => 'flymoney_status',
		'suppress_filters' => true,
	) );

	$available_statuses = array();

	foreach( $statuses as $key => $status ) {
		setup_postdata($status);

		$quantity = intval(get_post_meta( $status->ID, 'flymoney_status_meta_quantity', true ));
		$discount = get_post_meta( $status->ID, 'flymoney_status_meta_discount', true );
		$color = get_post_meta( $status->ID, 'flymoney_status_meta_color', true );
		$description = get_post_meta( $status->ID, 'flymoney_status_meta_description', true );

		if( $user_orders_count >= $quantity ) {
			array_push(
				$available_statuses, 
				array(
					'status' => $status->post_title,
					'quantity' => $quantity,
					'discount' => $discount,
				)
			);
		}		
	}
	wp_reset_postdata();

	$max_quantity = !empty($available_statuses) ? max(
		array_map(
			function($item) { 
				return $item['quantity'];
			}, 
			$available_statuses
		)
	) : 0;
	
	
	$max_array = $max_quantity > 0 ? array_filter(
		$available_statuses,
		function($item) use($max_quantity) {
			return $item['quantity'] === $max_quantity;
		}
	) : array();
	
	$max_status = !empty($max_array) ? array_values($max_array)[0]['status'] : '';

	?>
    <h3><?php _e("Статус клиента", "blank"); ?></h3>

    <table class="form-table">
    <tr>
        <th><label for="client_status"><?php _e("Статус"); ?></label></th>
        <td>
            
            <select name="client_status" id="client_status" style="width: 25em;">
				<option value="0">Не выбран...</option>
				<?php
					foreach( $statuses as $key => $status ){
						setup_postdata($status);
						?>
						<option 
							value="<?php echo $status->ID ?>"
							<?php if ( $status->ID == get_the_author_meta( 'client_status', $user->ID ) ) echo 'selected="selected"'; ?>
						>
							<?php echo $status->post_title; ?>
						</option>
						<?php
					}
					wp_reset_postdata();
				?>
			</select>
			<span class="description" style="margin-left: 15px;"><?php _e("Выберите статус"); ?></span>
        </td>
    </tr>
	<tr>
        <th><?php _e("Количество выполненных заказов"); ?></th>
        <td>
			<p class="description"><?php echo $user_orders_count; ?></p>
        </td>
    </tr>
	<?php if( isset($max_status) && !empty($max_status) ): ?>
		<tr>
			<th><?php _e("Доступен статус"); ?></th>
			<td>
				<p class="description"><b><?php echo $max_status; ?></b></p>
			</td>
		</tr>
	<?php endif; ?>
    </table>
<?php 
}

// сохраняем статус пользователя в БД
add_action( 'personal_options_update', 'save_status_user_profile_field' );
add_action( 'edit_user_profile_update', 'save_status_user_profile_field' );
function save_status_user_profile_field( $user_id ) {
    if ( empty( $_POST['_wpnonce'] ) || ! wp_verify_nonce( $_POST['_wpnonce'], 'update-user_' . $user_id ) ) {
        return;
    }
    
    if ( !current_user_can( 'edit_user', $user_id ) ) { 
        return false; 
    }
    update_user_meta( $user_id, 'client_status', $_POST['client_status'] );
}

// добавляем кастомные столбцы в раздел "Пользователи"
function new_modify_user_table( $column ) {
    $column['client_status'] = 'Статус';
	$column['client_orders_count'] = 'Кол-во выполненных заказов';
    return $column;
}
add_filter( 'manage_users_columns', 'new_modify_user_table' );

function new_modify_user_table_row( $val, $column_name, $user_id ) {

	$available_statuses = get_available_users_statuses();

	$user_status = array_values(array_filter(
		$available_statuses,
		function( $item ) use( $user_id ) {
			return $item['ID'] === intval(get_user_meta ( $user_id, 'client_status', true));
		}
	));

    switch ($column_name) {
        case 'client_status' :
        	
            return '<b style="background-color: ' . $user_status[0]['color'] . ';padding:4px 8px; border-radius:8px;width:100px;">' . ( isset($user_status) && !empty($user_status) ? $user_status[0]['status'] : '-') . '</b>';
		case 'client_orders_count' :
			return get_customer_completed_order_count( $user_id );
    }
    
	return $val;
}
add_filter( 'manage_users_custom_column', 'new_modify_user_table_row', 10, 3 );

/**
 * sheduler
 * 
* Обновление курсов валют по расписанию, задание с названием hourly_valute_update запускается 1 раз в час
* 
* Если с заданием что-то идет не так или нужно перезапустить:
* 1) Раскомментировать очистку - wp_clear_scheduled_hook()
* 2) Закомментировать add_action( 'wp', 'shedule_activation' );
* 3) Закомментировать add_action( 'hourly_valutes_update', 'do_valute_update');
* 4) Обновить страницу, не важно где - в админке или во фронтенде
* 5) Вернуть все обратно, т.е. раскомментировать хуки из п.п. 2 и 3, закомментировать очистку из п. 1 
*/

// очистка задания, см. выше инструкцию п.п. 1-5
//wp_clear_scheduled_hook( 'hourly_valute_update' );

// Добавляем запланированный хук, отключить если нужно перезапустить задание
add_action( 'wp', 'shedule_activation' );
function shedule_activation() {
	if( ! wp_next_scheduled( 'hourly_valutes_update' ) ) {
		wp_schedule_event( time(), 'hourly', 'hourly_valutes_update');
	}
}

// Запускаем задание и выполняем функцию update_flymoney_exchange_data, отключить если нужно перезапустить задание
add_action( 'hourly_valutes_update', 'do_valute_update');
function do_valute_update() {
	// задача использует метод update_valutes() класса ExchangeBankMethods
	require_once get_stylesheet_directory() . '/classes/class-exchange-bank-methods.php';
	$bank_methods = new ExchangeBankMethods();
	$bank_methods->update_valutes( get_exchange_rates_from_floatrates() );
	unset($bank_methods);
}
// end sheduler

// получаем массив всех курсов валют с сайта http://www.floatrates.com/
function get_exchange_rates_from_floatrates() {
	
	// подключаем класс курсов валют
	require_once get_stylesheet_directory() . '/classes/class-exchange-floatrates.php';
	
	// создаем инстанс класса
	$exchange_rates 	= new ExchangeFloatRates();
	// получаем массив с курсами валют
	$valutes = $exchange_rates->get_valutes_from_bank();
	
	// возвращаем курсы валют
	return $valutes;

} // end get valutes from floatrates

// получаем данные из объектного кеша или создаем кэш
function flymoney_get_data_from_transient($name, $data) {

	$cache = get_transient( '_flymoney_' . $name );
	$array = false === $cache ? array() : json_decode( json_encode( $cache ), TRUE);
	
	if( false === $cache ) {
		$array = json_decode( json_encode( $data ), TRUE);
		set_transient( '_flymoney_'  . $name, $array, 1 * HOUR_IN_SECONDS );
	}
	
	return $array;
}

// удалить кэш
function flymoney_clear_transient() {
	
	delete_transient('_flymoney_products');
	delete_transient('_flymoney_exchange');
	delete_transient('_flymoney_valutes');
	delete_transient('_flymoney_gateways');
	delete_transient('_flymoney_taxes');
}
//flymoney_clear_transient();


// добавляем react app
add_action( 'wp_enqueue_scripts', 'flymoney_react_app' );
function flymoney_react_app(){
	if ( !is_admin() ) {
		wp_enqueue_script(
			'flymoney-react-app', 
			'/wp-content/themes/astra-child/app/build/index.js', 
			array( 'wp-element' ), 
			null, 
			true 
		);
		/**
		 * Fix X-WP-Nonce on POST
		 * @see https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/
		 */
		wp_localize_script( 
			'flymoney-react-app', 
			'wpReactAppSettings', 
			array(
				'root' => esc_url_raw( rest_url() ),
				'nonce' => wp_create_nonce( 'wp_rest' ),
				'user_id' => get_current_user_id(),
				'user_status' => get_user_status(),
				'user_orders_count' => get_current_user_id() === 0 ? 0 : get_customer_completed_order_count( get_current_user_id() )
			)
		);
		
		wp_localize_script( 
			'flymoney-react-app', 
			'wpReactAppData', 
			array(
				'valutes' => flymoney_get_data_from_transient('valutes', get_exchange_rates_from_floatrates()),
				'flymoney_exchange' => flymoney_get_data_from_transient('exchange', get_posts( array(
					'numberposts' => -1,
					'orderby'     => 'date',
					'order'       => 'DESC',
					'post_type'   => 'flymoney_exchange',
					'suppress_filters' => true,
				) )),
				'products' => array_filter(
					array_map(
					function($item) {
						
						$variations = array();

						$children = $item->get_children();

						foreach ($children as $key => $value) {
							
							$variation = wc_get_product($value);
							$children_exploded = explode(' ', $variation->get_name());
							$valute_children = end($children_exploded);
							
							array_push($variations, array(
								'ID' => $variation->get_ID(),
								'name' => $variation->get_name(),
								'valute' => $valute_children,
								'status' => $variation->get_status(),
								'price' => $variation->get_price(),
								'regular_price' => $variation->get_regular_price(),
								'tax_status' => $variation->get_tax_status(),
								'tax_class' => $variation->get_tax_class(),
								'manage_stock' => $variation->get_manage_stock(),
								'stock_quantity' => $variation->get_stock_quantity(),
								'stock_status' => $variation->get_stock_status(),
								'image_src' => $variation->get_image_id() ? wp_get_attachment_image_url($variation->get_image_id()) : '',
							));
						}
						
						$item_exploded = explode(' ', $item->get_name());
						$valute_item = end($item_exploded);

						return array(
							'ID' => $item->get_ID(),
							'name' => $item->get_name(),
							'valute' => $valute_item,
							'status' => $item->get_status(),
							'variations' => $variations,
							'price' => $item->get_price(),
							'regular_price' => $item->get_regular_price(),
							'tax_status' => $item->get_tax_status(),
							'tax_class' => $item->get_tax_class(),
							'manage_stock' => $item->get_manage_stock(),
							'stock_quantity' => $item->get_stock_quantity(),
							'stock_status' => $item->get_stock_status(),
							'image_src' => wp_get_attachment_image_url($item->get_image_id()),
						);
					},
						wc_get_products( array(
							'limit' => -1,
							'status' => 'publish',
							'tax_status' => 'taxable'
						) )
					),
					function($item) {
						return count($item['variations']) > 0 && $item['stock_quantity'];
					}
				),
				'gateways' => WC()->payment_gateways->get_available_payment_gateways(),
				'taxes' => array_filter(array_map(
						function($tax_class) {
							return WC_Tax::get_rates_for_tax_class( $tax_class );
						},
						WC_Tax::get_tax_classes()
					),
					function($tax_class) {
						return $tax_class !== array();
					}
				)
			)
		);
	}
}


// Добавляем данные получателя в заказ в админке
add_action( 'woocommerce_admin_order_data_after_billing_address', 'display_receiver_order_data_in_admin', 20, 1 );
function display_receiver_order_data_in_admin( $order ){  ?>
	<h3>Получатель</h3>
	<div class="address">
		<p><?= get_post_meta( $order->id, 'receiver_fio', true ) ?></p>
		<p><strong>Телефон:</strong><a href="tel:<?= get_post_meta( $order->id, 'receiver_phone', true ) ?>"><?= get_post_meta( $order->id, 'receiver_phone', true ) ?></p>
	</div>
<?php 
}

// Добавляем детали обмена в заказ в админке
add_action( 'woocommerce_admin_order_data_after_shipping_address', 'display_exchange_order_data_in_admin', 20, 1 );
function display_exchange_order_data_in_admin( $order ){  ?>

	<h3>Детали обмена</h3>
	<div class="address">
		<p><b><?= get_post_meta( $order->id, 'send_from', true ) ?></b> (<?= get_post_meta( $order->id, 'amount_send', true ) ?> <?= get_post_meta( $order->id, 'send_currency', true ) ?>)</p>
		<p><b><?= get_post_meta( $order->id, 'receive_to', true ) ?></b> (<?= get_post_meta( $order->id, 'amount_receive', true ) ?> <?= get_post_meta( $order->id, 'receive_currency', true ) ?>)</p>
	</div>
	<div class="address">
		<p><b>Курс:</b> 1 <?= get_post_meta( $order->id, 'send_currency', true ) ?> = <?= round(( 1 / (float) get_post_meta( $order->id, 'exchange_rate', true ) ), 4) ?> <?= get_post_meta( $order->id, 'receive_currency', true ) ?></p>
		<p><b>Комиссия:</b> <?= get_post_meta( $order->id, 'receive_commission', true ) ?> <?= get_post_meta( $order->id, 'receive_currency', true ) ?></p>
	</div>
<?php 
}

// Добавляем детали обмена в письмо
add_action( 'woocommerce_email_order_meta', 'add_custom_email_order_meta', 10, 3 );
/*
 * @param $order Order Object - объект заказа
 * @param $sent_to_admin - емайл для администратора или пользователя
 * @param $plain_text HTML или Text (настраивается в WooCommerce > Настройки > Email'ы)
 */
function add_custom_email_order_meta( $order, $sent_to_admin, $plain_text ){

	$order_id = $order->get_order_number();

	if ( $plain_text === false ) { ?>

		<h3>Детали обмена</h3>
		<ul>
			<li><b><?= get_post_meta( $order_id, 'send_from', true ) ?></b> (<?= get_post_meta( $order_id, 'amount_send', true ) ?> <?= get_post_meta( $order_id, 'send_currency', true ) ?>)</li>
			<li><b><?= get_post_meta( $order_id, 'receive_to', true ) ?></b> (<?= get_post_meta( $order_id, 'amount_receive', true ) ?> <?= get_post_meta( $order_id, 'receive_currency', true ) ?>)</li>
					</ul>

	<?php 
	} else {
		echo "Детали обмена\n"
		. get_post_meta( $order_id, 'send_from', true ) . " " . get_post_meta( $order_id, 'amount_send', true ) . " " . get_post_meta( $order_id, 'send_currency', true ) .")"
		. get_post_meta( $order_id, 'receive_to', true ) . " (" . get_post_meta( $order_id, 'amount_receive', true ) . ") " . get_post_meta( $order_id, 'receive_currency', true ) .")"
		. "Курс: 1" . get_post_meta( $order_id, 'send_currency', true ) . " = " . round(( 1 / (float) get_post_meta( $order->id, 'exchange_rate', true ) ), 4) . " " . get_post_meta( $order_id, 'receive_currency', true )
		. "Комиссия: " . get_post_meta( $order_id, 'receive_commission', true );
	}
}

// запрещаем менеджеру магазина редактировать пункты заказа
add_filter( 'wc_order_is_editable', 'wc_make_orders_not_editable_for_shop_manager', 10, 2 );
function wc_make_orders_not_editable_for_shop_manager( $is_editable, $order ) {
	
	if( is_user_in_role( array('shop_manager') ) ) {
		$is_editable = false;
	}

    return $is_editable;
}

// вспомогательная функция, определяет входит ли пользователь в роли из указанного массива
function is_user_in_role( $roles, $user = false ){
	if( ! $user )           $user = wp_get_current_user();
	if( is_numeric($user) ) $user = get_userdata( $user );

	if( empty($user->ID) )
		return false;

	foreach( (array) $roles as $role )
		if( isset($user->caps[ $role ]) || in_array($role, $user->roles) )
			return true;

	return false;
}

// Добавляем ajax_url в админку
add_action('admin_head','add_admin_ajax_url');
if ( ! function_exists( 'add_admin_ajax_url' ) ) {
	function add_admin_ajax_url(){
		$variables = array (
			'ajax_url' => admin_url('admin-ajax.php'),
			);
		echo '<script type="text/javascript">window.wp_admin_data = '.json_encode($variables).';</script>';
	}
}

// Добавляем кнопку импорта курсов валют в админку на страницу "Курсы валют"
add_action('admin_head', 'admin_update_from_floatrates_button_to_head');
function admin_update_from_floatrates_button_to_head() {
    ?>
    <script>
    jQuery(function(){
        jQuery("body.wp-admin.post-type-flymoney_exchange .wrap h1").append('<small style="margin:0 20px;font-size:12px;font-weight:300;color:red;">Чтобы добавить новую валюту: 1) Прописать валюту в файл include/countries.php. 2) Нажать "Импорт" &xrarr;</small>');
		jQuery("body.wp-admin.post-type-flymoney_exchange .wrap h1").append('<button class="page-title-action" id="admin-update-from-floatrates" style="margin-left:15px;">Импорт</button>');
		jQuery('#admin-update-from-floatrates').on('click', () => {		
			jQuery.ajax({
				url: wp_admin_data.ajax_url,
				type: 'GET',
				data: {
					action: 'import_new_valutes_from_floatrates'
				},
				success(res, status, xhr) {
					if ( res.data && res.data.length > 0 ) {
						console.log('New valutes from include/countries.php', res.data, status);
						alert('Добавлены курсы валют: ' + res.data.join(', ') + ' обновите страницу');
					} else {
						console.log('New valutes not found in include/countries.php', res.data, status);
						alert('Новых валют не найдено. Добавьте в include/countries.php новые валюты и повторите импорт');
					}
						
				},
				error(error) {
					console.log(`Ajax import from floatrates error: ${JSON.stringify(error)}`);
				}
			});
		});
		
	});
    </script>
    <?php
}

// ajax для импорта новых курсов валют с сайта floatrates.com
// сраатывает при клике на "Импорт" на странице курсов валют в админке
add_action('wp_ajax_import_new_valutes_from_floatrates', 'import_new_valutes_from_floatrates');
add_action('wp_ajax_nopriv_import_new_valutes_from_floatrates', 'import_new_valutes_from_floatrates');
if ( ! function_exists( 'import_new_valutes_from_floatrates' ) ) {
	function import_new_valutes_from_floatrates() {

		// получаем массив валют из БД
		$valutes_excists = array_values(array_unique(array_map(function($item) {
			return explode('-',  $item->post_title)[0];
		}, get_posts( array(
			'numberposts' => -1,
			'orderby'     => 'date',
			'order'       => 'DESC',
			'post_type'   => 'flymoney_exchange',
			'suppress_filters' => true,
		) ))));
		
		// получаем массив валют из файла include/countries.php
		$valutes_excists_from_countries = array_keys(require get_stylesheet_directory() . '/include/countries.php');
		
		// сравниваем, получаем валюты, которые есть в файле, но нет в БД (новые в файле)
		$diff = array_values(array_diff($valutes_excists_from_countries, $valutes_excists));

		// если в include/countries.php есть новые валюты - выполняем импорт:
		if( !empty( $diff ) ) {
			// подключаем методы класса для импорта новых валют
			require_once get_stylesheet_directory() . '/classes/class-exchange-floatrates.php';
			require_once get_stylesheet_directory() . '/classes/class-exchange-bank-methods.php';
			$valutes 			= new ExchangeFloatRates();
			$bank_methods		= new ExchangeBankMethods();
			// импортируем новые валюты в БД
			$bank_methods->insert_valutes( $valutes->get_valutes_from_bank($diff) );
		}

		// возвращаем массив новых валют, либо пустой массив, если новых нет
		wp_send_json_success($diff);
	}
}


// добавляем меню и свою страницу заказов в админку
add_action('admin_menu', 'add_custom_admin_woo_order_page' );
if ( ! function_exists( 'add_custom_admin_woo_order_page' ) ) {
	function add_custom_admin_woo_order_page() {
		add_menu_page( 
			'Заявки на обмен', 
			'Заявки на обмен', 
			'publish_posts', 
			'custom-admin-order-page', 
			'add_react_app_to_custom_admin_order_page',
			'dashicons-database-view'
		);
	}
}
// добавляем заголовок на страницу заказов и тег для подключения react-приложения
function add_react_app_to_custom_admin_order_page() { ?>
	<div id="flymoney-admin-order-page-react-app"></div>
<?php	
}
// подключаем скрипт (build) страницы заказов в админку
add_action( 'admin_enqueue_scripts', 'flymoney_add_admin_order_page_build' );
function flymoney_add_admin_order_page_build( $hook_suffix ){

	if( $hook_suffix === 'toplevel_page_custom-admin-order-page') {
		/**
		 * Enqueue admin order page react app build
		 */
		wp_enqueue_script(
			'flymoney-admin-order-page-react-app', 
			'/wp-content/themes/astra-child/admin-order-page-app/build/index.js', 
			array( 'wp-element' ), 
			null, 
			true 
		);

		wp_localize_script( 
			'flymoney-admin-order-page-react-app', 
			'wpReactAdminAppSettings', 
			array(
				'root' => esc_url_raw( rest_url() ),
				'nonce' => wp_create_nonce( 'wp_rest' ),
				'user_id' => get_current_user_id()
			)
		);
		
		wp_localize_script( 
			'flymoney-admin-order-page-react-app', 
			'wpReactAdminAppData', 
			array(
				'orders' => array_map(
					function($order_id) {
						
						$order = wc_get_order($order_id);
						
						$date_created = $order->get_date_created()->date('d-m-Y H:i:s');
						$status = $order->get_status();
						$item_name = implode(
							'',
							array_map(
								function($order_item ) {
									return $order_item->get_name();
								},
								$order->get_items()
							)
						);
						$billing_first_name = $order->get_billing_first_name();
						$billing_phone = $order->get_billing_phone();
						$billing_email = $order->get_billing_email();
						$bank_send = explode(' - ', $item_name)[0];
						$bank_receive = explode(' - ', $item_name)[1];
						$amount_send = get_post_meta($order_id, 'amount_send', true);
						$amount_receive = get_post_meta($order_id, 'amount_receive', true);
						
						$client_status = get_post_meta($order_id, 'client_status', true);
						$discount = get_post_meta($order_id, 'discount', true);
						
						$send_from = get_post_meta($order_id, 'send_from', true);
						$receive_to = get_post_meta($order_id, 'receive_to', true);

						$send_currency = get_post_meta($order_id, 'send_currency', true);
						$receive_currency = get_post_meta($order_id, 'receive_currency', true);

						$edit_lock = get_post_meta($order_id, '_edit_lock', true);
						$edit_lock_date = '';
						$edit_lock_user_id = '';
						
						if( isset($edit_lock) && !empty($edit_lock)) {
							$edit_lock_date = date('d-m-Y H:i:s', explode(':',$edit_lock)[0]);
							$edit_lock_user_id = explode(':',$edit_lock)[1];
						}
						
						return array(
							'id' => $order_id,
							'date_created' => $date_created,
							'status' => $status,
							'billing_first_name' => $billing_first_name,
							'billing_phone' => $billing_phone,
							'billing_email' => $billing_email,
							'bank_send' => $bank_send,
							'bank_receive' => $bank_receive,
							'amount_send' => $amount_send,
							'amount_receive' => $amount_receive,
							'client_status' => $client_status,
							'discount' => $discount,
							'send_from' => $send_from,
							'receive_to' => $receive_to,
							'send_currency' => $send_currency,
							'receive_currency' => $receive_currency,
							'edit_lock_date' => $edit_lock_date,
							'edit_lock_user_id' => $edit_lock_user_id
						);
					},
					get_posts(array(
						'numberposts' => -1,
						'orderby'     => 'date',
						'order'       => 'DESC',
						'post_type'   => 'shop_order',
						'post_status' => 'wc-completed, wc-processing, wc-cancelled, wc-refunded, wc-on-hold, wc-pending', //wc-failed
						'fields'      => 'ids',
						'suppress_filters' => true,
				  	))
				)
			)
		);
	}
}

// end Mihail
